import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '@/transactions/transactions.service';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';
import { silentBlockEncodingFixture } from '@/silent-blocks/silent-blocks.service.fixtures';
import { SilentBlocksGateway } from '@/silent-blocks/silent-blocks.gateway';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from '@/transactions/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionOutput } from '@/transactions/transaction-output.entity';

describe('SilentBlocksService', () => {
    let service: SilentBlocksService;
    let transactionRepository: Repository<Transaction>;
    let transactionOutputRepository: Repository<TransactionOutput>;
    let datasource: DataSource;

    beforeEach(async () => {
        datasource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            entities: [Transaction, TransactionOutput],
            synchronize: true,
            logging: false,
        });
        await datasource.initialize();
        transactionRepository = datasource.getRepository(Transaction);
        transactionOutputRepository =
            datasource.getRepository(TransactionOutput);

        const module: TestingModule = await Test.createTestingModule({
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

            const encodedBlock = await service.getSilentBlockByHash(
                blockHash,
                false,
            );

            expect(encodedBlock.toString('hex')).toEqual(encodedBlockHex);
        },
    );

    it('should omit spent Outputs if filterSpent is set to true', async () => {
        // Save initial transactions to the repository
        await transactionRepository.save(
            silentBlockEncodingFixture[0].transactions,
        );

        // Fetch and verify non inclusion of spent outputs
        let encodedBlock = await service.getSilentBlockByHash(
            silentBlockEncodingFixture[0].blockHash,
            true,
        );

        expect(encodedBlock.toString('hex')).toEqual(
            silentBlockEncodingFixture[0].filteredOutputEncodedBlockHex,
        );

        // Mark all outputs as spent
        await transactionOutputRepository.update({}, { isSpent: true });

        encodedBlock = await service.getSilentBlockByHash(
            silentBlockEncodingFixture[0].blockHash,
            true,
        );

        expect(encodedBlock.toString('hex')).toEqual('0000');
    });

    afterEach(async () => {
        await datasource.destroy();
    });
});
