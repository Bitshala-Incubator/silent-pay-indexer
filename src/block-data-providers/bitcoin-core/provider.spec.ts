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
describe('Bitcoincore Provider', () => {
    let provider: BitcoinCoreProvider;

    beforeEach(async () => {
        const fakeConfigService = {
            get: (key: string) => {
                if (key == 'bitcoinCore') {
                    return bitcoinCoreConfig;
                }
                if (key == 'app.network') {
                    return 'regtest';
                }
                return null;
            },
        };

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
                    useValue: fakeConfigService as unknown as ConfigService,
                },
                {
                    provide: OperationStateService,
                    useValue: {
                        getOperationState: jest.fn(),
                    },
                },
            ],
        }).compile();

        provider = module.get<BitcoinCoreProvider>(BitcoinCoreProvider);

        jest.spyOn(provider as any, 'getTipHeight').mockImplementation(() => {
            return Promise.resolve(3);
        });
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
        const result = await provider.processBlock(3);
        expect(result).toHaveLength(1);
        expect(result).toEqual(
            expect.arrayContaining([...parsedTransactions.values()]),
        );
    });
});
