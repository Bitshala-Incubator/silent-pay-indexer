import { TransactionInput, TransactionOutput } from '@/indexer/indexer.service';

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

export interface Input {
    txid: string;
    vout: number;
    scriptSig: {
        hex: string;
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

export type BitcoinCoreOperationState = {
    currentBlockHeight: number;
    indexedBlockHeight: number;
};

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
