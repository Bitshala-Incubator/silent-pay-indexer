import { Test, TestingModule } from '@nestjs/testing';
import { DbTransactionService } from '@/db-transaction/db-transaction.service';
import { StorageService } from '@/storage/storage.service';

describe('DbTransactionService', () => {
    let service: DbTransactionService;
    let mockCommit: jest.Mock;

    beforeEach(async () => {
        mockCommit = jest.fn().mockResolvedValue(undefined);

        const mockStorageService = {
            createBatch: jest.fn().mockReturnValue({
                put: jest.fn().mockReturnThis(),
                del: jest.fn().mockReturnThis(),
                commit: mockCommit,
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DbTransactionService,
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                },
            ],
        }).compile();
        service = module.get<DbTransactionService>(DbTransactionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should commit batch on success', async () => {
        const dummyExecutable = jest.fn().mockResolvedValue('result');
        const result = await service.execute(dummyExecutable);

        expect(dummyExecutable).toHaveBeenCalledTimes(1);
        expect(mockCommit).toHaveBeenCalledTimes(1);
        expect(result).toBe('result');
    });

    it('should discard batch on error (no commit)', async () => {
        const dummyExecutable = jest
            .fn()
            .mockRejectedValue(new Error('mock error'));

        await expect(service.execute(dummyExecutable)).rejects.toThrow(
            'mock error',
        );

        expect(dummyExecutable).toHaveBeenCalledTimes(1);
        expect(mockCommit).toHaveBeenCalledTimes(0);
    });
});
