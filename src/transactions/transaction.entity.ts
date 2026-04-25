import { TransactionOutput } from '@/transactions/transaction-output.entity';

export class Transaction {
    id: string; // txid (hex, 64 chars)
    blockHeight: number;
    blockHash: string; // hex (64 chars)
    blockTime: number;
    scanTweak: string; // hex (66 chars)
    outputs: TransactionOutput[];
}
