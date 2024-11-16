import { Test, TestingModule } from '@nestjs/testing';
import { Transaction } from '@/transactions/transaction.entity';
import { IndexerService } from '@/indexer/indexer.service';
import { testData } from '@/indexer/indexer.fixture';
import { DataSource } from 'typeorm';
import { DbTransactionService } from '@/db-transaction/db-transaction.service';

describe('IndexerService', () => {
    let service: IndexerService;
    let dbTransactionService: DbTransactionService;
    let dataSource: DataSource;

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            entities: [Transaction],
            synchronize: true,
            logging: false,
        });
        await dataSource.initialize();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IndexerService,
                DbTransactionService,
                {
                    provide: DataSource,
                    useValue: dataSource,
                },
            ],
        }).compile();

        service = module.get<IndexerService>(IndexerService);
        dbTransactionService =
            module.get<DbTransactionService>(DbTransactionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it.each(testData)(
        'should validate that scanTweaks are created for only valid transactions',
        async (transaction) => {
            await dbTransactionService.execute(async (manager) => {
                await service.index(
                    transaction.txid,
                    transaction.vin,
                    transaction.vout,
                    0,
                    '0000000000000000000000000000000000000000000000000000000000000000',
                    manager,
                );
            });

            const transactionEntity =
                await dbTransactionService.execute<Transaction>(
                    async (manager) =>
                        manager.findOne(Transaction, {
                            where: { id: transaction.txid },
                        }),
                );

            if (transaction.scanTweak) {
                expect(transactionEntity.scanTweak).toBe(transaction.scanTweak);
            } else {
                expect(transactionEntity).toBeNull();
            }
        },
    );

    afterEach(async () => {
        await dataSource.destroy();
    });
});
