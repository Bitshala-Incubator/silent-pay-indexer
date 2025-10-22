import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1761122821202 implements MigrationInterface {
    name = 'Migrations1761122821202';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_transaction" ("id" varchar(64) PRIMARY KEY NOT NULL, "blockHeight" integer NOT NULL, "blockHash" varchar(64) NOT NULL, "scanTweak" text NOT NULL, "blockTime" integer NOT NULL)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_transaction"("id", "blockHeight", "blockHash", "blockTime", "scanTweak") SELECT "id", "blockHeight", "blockHash", ${Date.now()} AS "blockTime", "scanTweak" FROM "transaction"`,
        );
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(
            `ALTER TABLE "temporary_transaction" RENAME TO "transaction"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "transaction" RENAME TO "temporary_transaction"`,
        );
        await queryRunner.query(
            `CREATE TABLE "transaction" ("id" varchar(64) PRIMARY KEY NOT NULL, "blockHeight" integer NOT NULL, "blockHash" varchar(64) NOT NULL, "scanTweak" text NOT NULL)`,
        );
        await queryRunner.query(
            `INSERT INTO "transaction"("id", "blockHeight", "blockHash", "scanTweak") SELECT "id", "blockHeight", "blockHash", "scanTweak" FROM "temporary_transaction"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_transaction"`);
    }
}
