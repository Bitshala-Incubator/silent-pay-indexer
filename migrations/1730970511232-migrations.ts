import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1730970511232 implements MigrationInterface {
    name = 'Migrations1730970511232';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "transaction" ("id" text PRIMARY KEY NOT NULL, "blockHeight" integer NOT NULL, "blockHash" text NOT NULL, "scanTweak" text NOT NULL, "outputs" text NOT NULL, "isSpent" boolean NOT NULL)`,
        );
        await queryRunner.query(
            `CREATE TABLE "block_state" ("blockHeight" integer PRIMARY KEY NOT NULL, "blockHash" text NOT NULL)`,
        );
        await queryRunner.query(
            `CREATE TABLE "operation_state" ("id" text PRIMARY KEY NOT NULL, "state" text NOT NULL)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "operation_state"`);
        await queryRunner.query(`DROP TABLE "block_state"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
    }
}
