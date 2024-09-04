import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '@/transactions/transactions.controller';
import { TransactionsService } from '@/transactions/transactions.service';
import { Transaction } from '@/transactions/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiHelper } from '@e2e/helpers/api.helper';
import { ProviderType, ServiceStatus } from '@/common/enum';

const mockTransactions: Transaction[] = [
    {
        id: '1',
        blockHeight: 841744,
        blockHash:
            '0000000000000000000162b9fbce878ab4140c6bf5ea3881f14736a266e4d98d',
        scanTweak:
            '024ac253c216532e961988e2a8ce266a447c894c781e52ef6cee902361db960004',
        outputs: [
            {
                pubKey: '51203e9fce73d4e77a4809908e3c3a2e54ee147b9312dc5044a193d1fc85de46e3c1',
                vout: 1,
                value: 100000,
            },
        ],
        isSpent: false,
    },
    {
        id: '2',
        blockHeight: 841744,
        blockHash:
            '0000000000000000000162b9fbce878ab4140c6bf5ea3881f14736a266e4d98d',
        scanTweak:
            '024ac253c216532e961988e2a8ce266a447c894c781e52ef6cee902361db960004',
        outputs: [
            {
                pubKey: '51203e9fce73d4e77a4809908e3c3a2e54ee147b9312dc5044a193d1fc85de46e3c1',
                vout: 2,
                value: 100000,
            },
        ],
        isSpent: true,
    },
    {
        id: '3',
        blockHeight: 841745,
        blockHash:
            '000000000000000000030d3be33f251ddeb5d7e480f28970064f594ba9dfb033',
        scanTweak:
            '024cad5180a093d3af0f49f586bdf37f890920178e68e80561ed53351d0fa499ad',
        outputs: [
            {
                pubKey: '5120f4c2da807f89cb1501f1a77322a895acfb93c28e08ed2724d2beb8e44539ba38',
                vout: 3,
                value: 100000,
            },
        ],
        isSpent: false,
    },
];

describe('TransactionController', () => {
    let controller: TransactionController;
    let transactionsService: TransactionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
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

        expect(getTransactionByBlockHashSpy).toHaveBeenCalledWith(blockHash);
        expect(controllerResult).toEqual({
            transactions: mockTransactions,
        });
    });
});

describe('Index Processing', () => {
    let apiHelper: ApiHelper;

    beforeAll(() => {
        apiHelper = new ApiHelper();
    });

    it('should process transactions and build index using Esplora Provider', async () => {
        const { data, status } = await apiHelper.get(`/process-transactions?provider=${ProviderType.ESPLORA}`);

        expect(status).toBe(200);
        expect(data).toEqual(ServiceStatus.PROCESSED);
    });

    it('should process transactions and build index using Bitcoin RPC', async () => {
        const { data, status } = await apiHelper.get(`/process-transactions?provider=${ProviderType.BITCOIN_CORE_RPC}`);

        expect(status).toBe(200);
        expect(data).toEqual(ServiceStatus.PROCESSED);
    });

    it('should handle invalid transactions gracefully', async () => {
        const { data, status } = await apiHelper.get(`/process-transactions?provider=InvalidProvider`);

        expect(status).toBe(400);
        expect(data).toEqual(ServiceStatus.INVALID);
    });

    it('should handle network delays gracefully', async () => {
        const { data, status } = await apiHelper.get(`/process-transactions?provider=DelayedProvider`);

        expect(status).toBe(200);
        expect(data).toEqual(ServiceStatus.DELAYED);
    });

    it('should handle reorgs gracefully', async () => {
        const { data, status } = await apiHelper.get(`/process-transactions?provider=ReorgProvider`);

        expect(status).toBe(200);
        expect(data).toEqual(ServiceStatus.REORG_HANDLED);
    });

    it('should verify indexed data accuracy', async () => {
        const { data, status } = await apiHelper.get(`/verify-index`);

        expect(status).toBe(200);
        expect(data).toEqual(ServiceStatus.INDEX_VERIFIED);
    })
});