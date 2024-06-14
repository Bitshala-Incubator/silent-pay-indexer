import {
    blockCountToHash,
    blocks,
    rawTransactions,
} from '@/block-providers/providers/bitcoin-core/provider-fixtures';

export const BitcoinCoreClient = {
    getBlockCount: () => {
        return 3;
    },
    getBlockHash: (height: number) => {
        return blockCountToHash.get(height);
    },
    getBlock: (hash: string) => {
        return blocks.get(hash);
    },
    getRawTransaction: (hash: string) => {
        return rawTransactions.get(hash);
    },
};
