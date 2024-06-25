import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '@/transactions/transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '@/transactions/transaction.entity';
import { IndexerService } from '@/indexer/indexer.service';
import { testData } from '@/indexer/indexer.fixture';

describe('IndexerService', () => {
    let service: IndexerService;
    const saveMock = jest.fn();

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IndexerService,
                TransactionsService,
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: {
                        save: saveMock,
                    },
                },
            ],
        }).compile();

        service = module.get<IndexerService>(IndexerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it.each(testData)('should index transaction', async (testData) => {
        await service.index(
            '0000000000000000000000000000000000000000000000000000000000000000',
            testData.vin,
            testData.vout,
            0,
            '0000000000000000000000000000000000000000000000000000000000000000',
        );

        if (testData.scanTweak) {
            expect(saveMock).toHaveBeenCalled();
            expect(saveMock.mock.calls[0][0].scanTweak).toBe(
                testData.scanTweak,
            );
        } else {
            expect(saveMock).not.toHaveBeenCalled();
        }

        jest.clearAllMocks();
    });
});
