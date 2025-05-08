import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { TransactionsService } from '@/transactions/transactions.service';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';
import { silentBlockEncodingFixture } from '@/silent-blocks/silent-blocks.service.fixtures';
import { SilentBlocksGateway } from '@/silent-blocks/silent-blocks.gateway';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from '@/transactions/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SilentBlocksService', () => {
    let service: SilentBlocksService;
    let transactionRepository: Repository<Transaction>;
    let datasource: DataSource;

    beforeEach(async () => {
        datasource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            entities: [Transaction],
            synchronize: true,
            logging: false,
        });
        await datasource.initialize();
        transactionRepository = datasource.getRepository(Transaction);

        const module: TestingModule = await Test.createTestingModule({
            imports: [CacheModule.register()],
            providers: [
                SilentBlocksService,
                TransactionsService,
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: transactionRepository,
                },
                {
                    provide: SilentBlocksGateway,
                    useValue: jest.fn(),
                },
            ],
        }).compile();

        service = module.get<SilentBlocksService>(SilentBlocksService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it.each(silentBlockEncodingFixture)(
        'should encode a silent block correctly by block height: $blockHeight',
        async ({ transactions, blockHeight, encodedBlockHex }) => {
            await transactionRepository.save(transactions);

            const encodedBlock = await service.getSilentBlockByHeight(
                blockHeight,
            );

            expect(encodedBlock.toString('hex')).toEqual(encodedBlockHex);
        },
    );

    it.each(silentBlockEncodingFixture)(
        'should encode a silent block correctly by block hash: $blockHash',
        async ({ transactions, blockHash, encodedBlockHex }) => {
            await transactionRepository.save(transactions);

            const encodedBlock = await service.getSilentBlockByHash(blockHash);

            expect(encodedBlock.toString('hex')).toEqual(encodedBlockHex);
        },
    );

    afterEach(async () => {
        await datasource.destroy();
    });
});
