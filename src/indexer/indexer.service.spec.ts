import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '@/transactions/transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '@/transactions/transaction.entity';
import { IndexerService } from '@/indexer/indexer.service';
import { testData } from '@/indexer/indexer.fixture';
import { DataSource, Repository } from 'typeorm';

describe('IndexerService', () => {
    let service: IndexerService;
    let repository: Repository<Transaction>;
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
        repository = dataSource.getRepository(Transaction);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IndexerService,
                TransactionsService,
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: repository,
                },
            ],
        }).compile();

        service = module.get<IndexerService>(IndexerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it.each(testData)(
        'should validate that scanTweaks are created for only valid transactions',
        async (transaction) => {
            await service.index(
                transaction.txid,
                transaction.vin,
                transaction.vout,
                0,
                '0000000000000000000000000000000000000000000000000000000000000000',
            );

            const transactionEntity = await repository.findOne({
                where: { id: transaction.txid },
            });

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
