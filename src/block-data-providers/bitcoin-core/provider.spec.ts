import { ConfigService } from '@nestjs/config';
import { BitcoinCoreProvider } from '@/block-data-providers/bitcoin-core/provider';
import {
    bitcoinCoreConfig,
    parsedTransactions,
} from '@/block-data-providers/bitcoin-core/provider-fixtures';
import { IndexerService } from '@/indexer/indexer.service';
import { OperationStateService } from '@/operation-state/operation-state.service';
import {
    blockCountToHash,
    blocks,
    rawTransactions,
} from '@/block-data-providers/bitcoin-core/provider-fixtures';
import { Test, TestingModule } from '@nestjs/testing';
import { BlockStateService } from '@/block-state/block-state.service';
import { DbTransactionService } from '@/db-transaction/db-transaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Bitcoin Core Provider', () => {
    let provider: BitcoinCoreProvider;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BitcoinCoreProvider,
                {
                    provide: IndexerService,
                    useValue: {
                        index: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key == 'bitcoinCore') {
                                return bitcoinCoreConfig;
                            }
                            if (key == 'app.network') {
                                return 'regtest';
                            }
                            return null;
                        },
                    },
                },
                {
                    provide: OperationStateService,
                    useValue: {
                        getOperationState: jest.fn(),
                    },
                },
                {
                    provide: BlockStateService,
                    useClass: jest.fn(),
                },
                {
                    provide: DbTransactionService,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: EventEmitter2,
                    useValue: jest.fn(),
                },
            ],
        }).compile();

        provider = module.get<BitcoinCoreProvider>(BitcoinCoreProvider);

        jest.spyOn(provider as any, 'getTipHeight').mockResolvedValue(3);

        jest.spyOn(provider as any, 'getBlockHash').mockImplementation(
            (height: number) => {
                return Promise.resolve(blockCountToHash.get(height));
            },
        );
        jest.spyOn(provider as any, 'getBlock').mockImplementation(
            (hash: string) => {
                return Promise.resolve(blocks.get(hash));
            },
        );
        jest.spyOn(provider as any, 'getRawTransaction').mockImplementation(
            (hash: string) => {
                return Promise.resolve(rawTransactions.get(hash));
            },
        );
    });

    it('should process each transaction of a block appropriately', async () => {
        const { transactions } = await provider.processBlock(3, 2);
        expect(transactions).toHaveLength(1);
        expect(transactions).toEqual(
            expect.arrayContaining([...parsedTransactions.values()]),
        );
    });
});
