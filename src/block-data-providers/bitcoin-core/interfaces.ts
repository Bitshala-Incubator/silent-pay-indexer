import { TransactionInput, TransactionOutput } from '@/indexer/indexer.service';
import { BaseOperationState } from '@/block-data-providers/base-block-data-provider.abstract';

export interface Block {
    height: number;
    hash: string;
    tx: BlockTransaction[];
}

export interface BlockTransaction {
    txid: string;
    hash: string;
    vin: Input[];
    vout: Output[];
}

export interface NetworkInfo {
    version: number;
}

export interface Input {
    txid: string;
    vout: number;
    scriptSig: {
        hex: string;
    };
    prevout?: {
        scriptPubKey: {
            hex: string;
        };
    };
    txinwitness: string[];
}

export interface Output {
    value: number;
    n: number;
    scriptPubKey: {
        hex: string;
    };
}

export interface BitcoinCoreOperationState extends BaseOperationState {
    currentBlockHeight: number;
    indexedBlockHeight: number;
}

export type Transaction = {
    txid: string;
    vin: TransactionInput[];
    vout: TransactionOutput[];
    blockHeight: number;
    blockHash: string;
};

export interface RPCRequestBody {
    method: string;
    params: (string | number | boolean)[];
}
