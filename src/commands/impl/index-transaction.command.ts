export type TransactionInput = {
    txid: string; // transaction id
    vout: number; // output index
    scriptSig: string; // unlocking script
    witness?: string[]; // witness data
    prevOutScript: string; // previous output script
};

export type TransactionOutput = {
    scriptPubKey: string;
    value: number;
};

export class IndexTransactionCommand {
    constructor(
        public readonly txid: string,
        public readonly vin: TransactionInput[],
        public readonly vout: TransactionOutput[],
        public readonly blockHeight: number,
        public readonly blockHash: string,
    ) {}
}
