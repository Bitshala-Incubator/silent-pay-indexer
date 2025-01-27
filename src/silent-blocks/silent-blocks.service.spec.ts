import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '@/transactions/transactions.service';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';
import {
    silentBlockEncodingFixture,
    verifyFilterTransactionFixture,
} from '@/silent-blocks/silent-blocks.service.fixtures';
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

    it('should omit transaction if all outputs are spent', async () => {
        // Save initial transactions to the repository
        await transactionRepository.save(
            verifyFilterTransactionFixture.transactions,
        );

        // Fetch and verify the fully encoded block
        let encodedBlock = await service.getSilentBlockByHash(
            verifyFilterTransactionFixture.blockHash,
            true,
        );

        expect(encodedBlock.toString('hex')).toEqual(
            verifyFilterTransactionFixture.fullyEncodedBlock,
        );

        // Fetch outputs to spend
        const transactionToSpend =
            verifyFilterTransactionFixture.transactions[0];
        const outputs = await transactionOutputRepository.find({
            where: { transaction: { id: transactionToSpend.id } },
        });

        // Mark Some output as Spent
        const partiallySpentOutputs = outputs.map((output, index) => ({
            ...output,
            isSpent: index % 2 == 0,
        }));

        await transactionOutputRepository.save(partiallySpentOutputs);

        // Fetch and verify that all transactions are returned
        encodedBlock = await service.getSilentBlockByHash(
            verifyFilterTransactionFixture.blockHash,
            true,
        );

        expect(encodedBlock.toString('hex')).toEqual(
            verifyFilterTransactionFixture.fullyEncodedBlock,
        );

        // Mark All outputs as spent
        const fullySpentOutputs = outputs.map((output) => ({
            ...output,
            isSpent: true,
        }));

        await transactionOutputRepository.save(fullySpentOutputs);

        // Fetch and verify that transactions with fully spent outputs are omitted
        encodedBlock = await service.getSilentBlockByHash(
            verifyFilterTransactionFixture.blockHash,
            true,
        );

        expect(encodedBlock.toString('hex')).toEqual(
            verifyFilterTransactionFixture.partiallyEncodeBlock,
        );
    });

    afterEach(async () => {
        await datasource.destroy();
    });
});
