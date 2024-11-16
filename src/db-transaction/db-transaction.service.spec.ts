import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { DbTransactionService } from '@/db-transaction/db-transaction.service';
import { MockDataSource } from '@/db-transaction/db-transaction.mock';

describe('DbTransactionService', () => {
    let service: DbTransactionService;
    let mockQueryRunner: QueryRunner;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DbTransactionService,
                {
                    provide: getDataSourceToken('default'),
                    useClass: MockDataSource,
                },
            ],
        }).compile();
        service = module.get<DbTransactionService>(DbTransactionService);
        mockQueryRunner = module
            .get<DataSource>(getDataSourceToken('default'))
            .createQueryRunner();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should commit transaction and release query runner on success', async () => {
        const dummyExecutable = jest.fn();
        await service.execute(dummyExecutable);
        expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
        expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
        expect(dummyExecutable).toHaveBeenCalledTimes(1);
        expect(dummyExecutable.mock.calls[0][0]).toBe(mockQueryRunner.manager);
        expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
        expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
        expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should roll back transaction and release query runner on error', async () => {
        const dummyExecutable = jest.fn();
        dummyExecutable.mockRejectedValue(new Error('mock error'));
        await expect(service.execute(dummyExecutable)).rejects.toThrow(
            'mock error',
        );
        expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
        expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
        expect(dummyExecutable).toHaveBeenCalledTimes(1);
        expect(dummyExecutable.mock.calls[0][0]).toBe(mockQueryRunner.manager);
        expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(0);
        expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
        expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
});
