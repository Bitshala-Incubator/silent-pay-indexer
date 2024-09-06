import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { DataSource } from 'typeorm';

export class DatabaseHelper {
    private dataSource: DataSource;

    constructor(configPath = './config/e2e.config.yaml') {
        const config = yaml.load(
            readFileSync(configPath, 'utf8'),
        ) as Record<string, any>;

        this.dataSource = new DataSource({
            type: 'sqlite',
            database: config.db.path,
            synchronize: config.db.synchronize,
        });
    }

    async query(query: string) {
        return await this.dataSource.query(query);
    }

    async getIndexedBlockHeight(): Promise<number> {
        return this.dataSource.query(
            `SELECT json_extract("state", '$.indexedBlockHeight') as indexedBlockHeight
             FROM "operation_state"
             WHERE "id" = 'bitcoincore-operation-state'
             ORDER BY "id" DESC LIMIT 1`,
        );
    }

    async findTransactionById(id: string) {
        return this.dataSource.query(
            `SELECT * FROM "transaction" WHERE id = '${id}' AND "isSpent" = 0`,
        );
    }

    async findTransactionByBlockHeight(blockHeight: number) {
        return this.dataSource.query(
            `SELECT * FROM "transaction" WHERE "blockHeight" = ${blockHeight}`,
        );
    }

    async queryUntilTimeout(
        query: string,
        timeout: number,
        handler: (result: any) => boolean,
    ) {
        const start = Date.now();
        let result = await this.dataSource.query(query);
        while (!handler(result)) {
            if (Date.now() - start > timeout) {
                throw new Error('Timeout reached while waiting for operation');
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
            result = await this.dataSource.query(query);
        }
        return result;
    }

    async init() {
        await this.dataSource.initialize();
    }

    async close() {
        await this.dataSource.destroy();
    }
}
