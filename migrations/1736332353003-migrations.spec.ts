import { Migrations1736332353003 } from '@migrations/1736332353003-migrations';
import { QueryRunner, DataSource } from 'typeorm';

export const testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: false,
    logging: false,
});

let dataSource: DataSource;
let queryRunner: QueryRunner;
const totalOutputs: {
    transactionId: string;
    vout: number;
    pubKey: string;
    value: number;
}[] = [];

export async function seedTestTransactions(queryRunner: QueryRunner) {
    const transactions = [];

    for (let i = 1; i <= 300; i++) {
        const transactionId = `tx${i}`;
        const blockHeight = 1000 + i;
        const blockHash = `block_hash_${i}`;
        const scanTweak = `tweak_${i}`;

        // Generating JSON outputs (alternating between 1 or 2 outputs)
        let outputs;
        if (i % 2 === 0) {
            outputs = [
                { pubKey: `pubkey_${i}_0`, vout: 0, value: 1000 },
                { pubKey: `pubkey_${i}_1`, vout: 1, value: 2000 },
            ];
        } else {
            outputs = [{ pubKey: `pubkey_${i}_0`, vout: 0, value: 3000 }];
        }

        totalOutputs.push(
            ...outputs.map((output) => ({ ...output, transactionId })),
        );
        const outputsJson = JSON.stringify(outputs);

        transactions.push(
            `('${transactionId}', ${blockHeight}, '${blockHash}', '${scanTweak}', '${outputsJson}', 0)`,
        );
    }

    // Insert all transactions in bulk
    const query = `
        INSERT INTO "transaction" (id, blockHeight, blockHash, scanTweak, outputs, isSpent) 
        VALUES ${transactions.join(', ')}
    `;

    await queryRunner.query(query);
}

describe('Migration1736332353003', () => {
    beforeAll(async () => {
        dataSource = await testDataSource.initialize();
        queryRunner = dataSource.createQueryRunner();
    });

    afterAll(async () => {
        await queryRunner.release();
        await dataSource.destroy();
    });

    test('Migration should correctly create transaction_output and migrate outputs', async () => {
        await queryRunner.startTransaction();
        try {
            // ✅ 1. Create `transaction` table
            await queryRunner.query(
                `CREATE TABLE "transaction" ("id" text PRIMARY KEY NOT NULL, "blockHeight" integer NOT NULL, "blockHash" text NOT NULL, "scanTweak" text NOT NULL, "outputs" text NOT NULL, "isSpent" boolean NOT NULL)`,
            );

            // ✅ 2. Insert sample data
            seedTestTransactions(queryRunner);

            // ✅ 3. Verify Inserted Transactions
            const count = await queryRunner.query(
                `SELECT COUNT(*) FROM "transaction"`,
            );
            expect(count[0]['COUNT(*)']).toBe(300);

            // ✅ 3. Run Migration
            const migration = new Migrations1736332353003();
            await migration.up(queryRunner);

            // ✅ 4. Check if `transaction_output` table exists
            const tables = await queryRunner.query(
                `SELECT name FROM sqlite_master WHERE type='table' AND name='transaction_output';`,
            );
            expect(tables.length).toBe(1);

            // // ✅ 5. Check migrated data
            const results = await queryRunner.query(
                `SELECT * FROM "transaction_output"`,
            );
            expect(results.length).toBe(totalOutputs.length);

            for (const output of totalOutputs) {
                const match = results.find(
                    (result) =>
                        result.transactionId === output.transactionId &&
                        result.vout === output.vout &&
                        result.pubKey === output.pubKey &&
                        result.value === output.value,
                );
                expect(match).not.toBeUndefined();
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    });

    test('Undo migration should restore original structure', async () => {
        await queryRunner.startTransaction();
        try {
            const migration = new Migrations1736332353003();
            await migration.down(queryRunner);

            // ✅ 1. Check if `transaction_output` table is dropped
            const tables = await queryRunner.query(
                `SELECT name FROM sqlite_master WHERE type='table' AND name='transaction_output';`,
            );
            expect(tables.length).toBe(0); // transaction_output should be gone

            // ✅ 2. Check if `outputs` column is restored
            const columns = await queryRunner.query(
                `PRAGMA table_info("transaction")`,
            );
            const hasOutputsColumn = columns.some(
                (col) => col.name === 'outputs',
            );
            expect(hasOutputsColumn).toBe(true);

            // // ✅ 5. Check undo migration data
            const results = await queryRunner.query(
                `SELECT * FROM "transaction"`,
            );

            const transactionOutputs = results
                .map((result) => JSON.parse(result.outputs))
                .flat();

            expect(transactionOutputs.length).toBe(totalOutputs.length);

            for (const output of totalOutputs) {
                const match = transactionOutputs.find(
                    (txOut) =>
                        txOut.vout === output.vout &&
                        txOut.value === output.value &&
                        txOut.pubKey === output.pubKey,
                );
                expect(match).not.toBeUndefined();
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    });
});
