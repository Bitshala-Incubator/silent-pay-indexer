import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

@Injectable()
export class DbTransactionService implements OnModuleDestroy {
    private readonly queryRunnerSet: Set<QueryRunner>;
    constructor(private readonly dataSource: DataSource) {
        this.queryRunnerSet = new Set();
    }

    async execute<T>(
        executable: (manager: EntityManager) => Promise<T>,
        isolationLevel: IsolationLevel = 'SERIALIZABLE',
    ): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();
        this.queryRunnerSet.add(queryRunner);
        await queryRunner.connect();
        await queryRunner.startTransaction(isolationLevel);
        try {
            const result = await executable(queryRunner.manager);
            await queryRunner.commitTransaction();
            return result;
        } catch (err) {
            // since we have errors, rollback the changes we made
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // we need to release a queryRunner which was manually instantiated
            await queryRunner.release();
            this.queryRunnerSet.delete(queryRunner);
        }
    }

    async onModuleDestroy(): Promise<void> {
        for (const queryRunner of this.queryRunnerSet) {
            await queryRunner.rollbackTransaction();
        }
    }
}
