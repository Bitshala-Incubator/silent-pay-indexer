import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1736332353003 implements MigrationInterface {
    name = 'Migrations1736332353003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`
                CREATE TABLE "transaction_output" (
                    "id" integer PRIMARY KEY NOT NULL,
                    "pubKey" text NOT NULL,
                    "vout" integer NOT NULL,
                    "value" integer NOT NULL,
                    "isSpent" boolean NOT NULL DEFAULT false,
                    "transactionId" INTEGER NOT NULL,
                    CONSTRAINT "FK_transaction_transaction_output" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE CASCADE
                )
            `);

            await queryRunner.query(`
                ALTER TABLE "transaction" DROP COLUMN "isSpent"
            `);

            await migrateTransactionOutputs(queryRunner);

            // Ensure all outputs are migrated before dropping the column
            const countOriginal = await queryRunner.query(
                `SELECT COUNT(*) FROM "transaction"`,
            );
            const countNew = await queryRunner.query(
                `SELECT COUNT(*) FROM "transaction_output"`,
            );

            if (countOriginal[0].count !== countNew[0].count) {
                throw new Error(
                    'Data migration incomplete: Outputs not fully migrated.',
                );
            }

            await queryRunner.query(`
                ALTER TABLE "transaction" DROP COLUMN "outputs"
            `);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "transaction" ADD COLUMN "outputs" TEXT NOT NULL DEFAULT '[]'
        `);

        await undoMigrateTransactionOutputs(queryRunner);

        await queryRunner.query(`
            ALTER TABLE "transaction" ADD COLUMN "isSpent" boolean NOT NULL DEFAULT false
        `);
    }
}

async function migrateTransactionOutputs(
    queryRunner: QueryRunner,
    batchSize = 50,
) {
    let lastId = '';

    while (true) {
        const transactions = await queryRunner.query(
            `SELECT id, outputs FROM "transaction" WHERE id > ? ORDER BY id ASC LIMIT ?`,
            [lastId, batchSize],
        );

        if (transactions.length === 0) break;

        const outputInserts = [];

        for (const tx of transactions) {
            const outputs = JSON.parse(tx.outputs);

            for (const output of outputs) {
                outputInserts.push([
                    output.pubKey,
                    output.vout,
                    output.value,
                    tx.id,
                ]);
            }
        }

        for (let i = 0; i < outputInserts.length; i += batchSize) {
            const batch = outputInserts.slice(i, i + batchSize);

            await queryRunner.query(
                `INSERT INTO "transaction_output" (pubKey, vout, value, isSpent, transactionId) VALUES ${batch
                    .map(() => '(?, ?, ?, false, ?)')
                    .join(', ')}`,
                batch.flat(),
            );
        }

        lastId = transactions[transactions.length - 1].id;
    }
}

async function undoMigrateTransactionOutputs(
    queryRunner: QueryRunner,
    batchSize = 50,
) {
    let lastId = '';

    while (true) {
        const transactions = await queryRunner.query(
            `SELECT DISTINCT "transactionId" FROM "transaction_output" WHERE "transactionId" > ? ORDER BY "transactionId" ASC LIMIT ?`,
            [lastId, batchSize],
        );

        if (transactions.length === 0) break;

        const transactionIds = transactions.map((tx) => tx.transactionId);

        for (const txId of transactionIds) {
            const outputs = await queryRunner.query(
                `SELECT "pubKey", "vout", "value" FROM "transaction_output" WHERE "transactionId" = ? ORDER BY "vout" ASC`,
                [txId],
            );

            const outputsJson = JSON.stringify(outputs);

            await queryRunner.query(
                `UPDATE "transaction" SET "outputs" = ? WHERE "id" = ?`,
                [outputsJson, txId],
            );
        }

        lastId = transactionIds[transactionIds.length - 1];
    }

    // Drop transaction_output safely
    await queryRunner.query(`PRAGMA foreign_keys=OFF;`);
    await queryRunner.query(`DROP TABLE "transaction_output"`);
    await queryRunner.query(`PRAGMA foreign_keys=ON;`);
}
