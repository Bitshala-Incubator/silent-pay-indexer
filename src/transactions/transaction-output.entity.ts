import { TransactionOutput as Output } from '@/indexer/indexer.service';

export class TransactionOutput {
    static fromOutput(output: Output, index: number): TransactionOutput {
        const newOutput = new TransactionOutput();
        newOutput.pubKey = output.scriptPubKey.substring(4);
        newOutput.value = output.value;
        newOutput.vout = index;

        return newOutput;
    }

    transactionId: string; // txid (hex, 64 chars)
    vout: number;
    pubKey: string; // hex (64 chars)
    value: number; // satoshis
    isSpent: boolean;
}
