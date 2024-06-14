import { ConfigService } from '@nestjs/config';
import { BitcoinCoreProvider } from '@/block-providers/providers/bitcoin-core/provider';
import {
    bitcoinCoreConfig,
    parsedTransactions,
} from '@/block-providers/providers/bitcoin-core/provider-fixtures';
import { BitcoinCoreClient } from '@/block-providers/providers/bitcoin-core/provider-mock';

describe('Bitcoincore Provider', () => {
    let provider: BitcoinCoreProvider;

    beforeEach(async () => {
        const fakeConfigService = {
            get: (key: string) => {
                if (key == 'bitcoincore') {
                    return bitcoinCoreConfig;
                }
                return null;
            },
        };
        provider = new BitcoinCoreProvider(
            fakeConfigService as unknown as ConfigService,
        );
        provider.client = BitcoinCoreClient;
        provider.START_BLOCK = 3;
    });

    it('should process each transaction appriopriately', async () => {
        const result = await provider.load();
        expect(result).toHaveLength(2);
        expect(result).toEqual(
            expect.arrayContaining([...parsedTransactions.values()]),
        );
    });
});
