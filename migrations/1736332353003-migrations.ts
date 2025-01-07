import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1736332353003 implements MigrationInterface {
    name = 'Migrations1736332353003';

    public async up(queryRunner: QueryRunner): Promise<void> {
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
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "outputs"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "transaction_output"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" ADD COLUMN "isSpent" boolean NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" ADD COLUMN "outputs" text NOT NULL
        `);
    }
}
