import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { TransactionController } from '@/transactions/transactions.controller';
import { TransactionsService } from '@/transactions/transactions.service';
import { Transaction } from '@/transactions/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockTransactions: Transaction[] = [
    {
        id: '1',
        blockHeight: 841744,
        blockHash:
            '0000000000000000000162b9fbce878ab4140c6bf5ea3881f14736a266e4d98d',
        blockTime: 1714634200,
        scanTweak:
            '024ac253c216532e961988e2a8ce266a447c894c781e52ef6cee902361db960004',
        outputs: [
            {
                pubKey: '51203e9fce73d4e77a4809908e3c3a2e54ee147b9312dc5044a193d1fc85de46e3c1',
                vout: 1,
                value: 100000,
                transactionId: '1',
                isSpent: false,
                transaction: new Transaction(),
            },
        ],
    },
    {
        id: '2',
        blockHeight: 841744,
        blockHash:
            '0000000000000000000162b9fbce878ab4140c6bf5ea3881f14736a266e4d98d',
        blockTime: 1714634200,
        scanTweak:
            '024ac253c216532e961988e2a8ce266a447c894c781e52ef6cee902361db960004',
        outputs: [
            {
                pubKey: '51203e9fce73d4e77a4809908e3c3a2e54ee147b9312dc5044a193d1fc85de46e3c1',
                vout: 2,
                value: 100000,
                transactionId: '2',
                isSpent: false,
                transaction: new Transaction(),
            },
        ],
    },
    {
        id: '3',
        blockHeight: 841745,
        blockHash:
            '000000000000000000030d3be33f251ddeb5d7e480f28970064f594ba9dfb033',
        blockTime: 1714634640,
        scanTweak:
            '024cad5180a093d3af0f49f586bdf37f890920178e68e80561ed53351d0fa499ad',
        outputs: [
            {
                pubKey: '5120f4c2da807f89cb1501f1a77322a895acfb93c28e08ed2724d2beb8e44539ba38',
                vout: 3,
                value: 100000,
                transactionId: '3',
                isSpent: false,
                transaction: new Transaction(),
            },
        ],
    },
];

describe('TransactionController', () => {
    let controller: TransactionController;
    let transactionsService: TransactionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CacheModule.register()],
            controllers: [TransactionController],
            providers: [
                TransactionsService,
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: {
                        find: () => mockTransactions,
                    },
                },
            ],
        }).compile();

        controller = module.get<TransactionController>(TransactionController);
        transactionsService =
            module.get<TransactionsService>(TransactionsService);
    });

    it('should return transactions by block height', async () => {
        const getTransactionByBlockHeightSpy = jest.spyOn(
            transactionsService,
            'getTransactionByBlockHeight',
        );
        const blockHeight = 841744;

        const controllerResult = await controller.getTransactionByBlockHeight(
            blockHeight,
        );

        expect(getTransactionByBlockHeightSpy).toHaveBeenCalledWith(
            blockHeight,
            false,
        );
        expect(controllerResult).toEqual({ transactions: mockTransactions });
    });

    it('should return transactions by block hash', async () => {
        const getTransactionByBlockHashSpy = jest.spyOn(
            transactionsService,
            'getTransactionByBlockHash',
        );

        const blockHash =
            '0000000000000000000162b9fbce878ab4140c6bf5ea3881f14736a266e4d98d';

        const controllerResult = await controller.getTransactionByBlockHash(
            blockHash,
        );

        expect(getTransactionByBlockHashSpy).toHaveBeenCalledWith(
            blockHash,
            false,
        );
        expect(controllerResult).toEqual({
            transactions: mockTransactions,
        });
    });

    it('should return transactions by block height range', async () => {
        const getTransactionsByBlockHeightRangeSpy = jest.spyOn(
            transactionsService,
            'getTransactionsByBlockHeightRange',
        );

        const startHeight = 841744;
        const endHeight = 841745;

        const controllerResult =
            await controller.getTransactionsByBlockHeightRange(
                startHeight,
                endHeight,
            );

        expect(getTransactionsByBlockHeightRangeSpy).toHaveBeenCalledWith(
            startHeight,
            endHeight,
            false,
        );
        expect(controllerResult).toEqual({
            transactions: mockTransactions,
        });
    });
});
