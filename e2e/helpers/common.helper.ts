import { Payment, Transaction } from 'bitcoinjs-lib';
import { IndexerService } from '@/indexer/indexer.service';
import {
    Transaction as EntityTransaction,
    TransactionOutput,
} from '@/transactions/transaction.entity';
import { SATS_PER_BTC } from '@/common/constants';
import * as currency from 'currency.js';

export function generateScanTweak(
    transaction: Transaction,
    outputs: Payment[],
    indexerService: IndexerService,
): [string, TransactionOutput[]] {
    const txins = transaction.ins.map((input, index) => {
        const isWitness = transaction.hasWitnesses();

        return {
            txid: input.hash.reverse().toString('hex'),
            vout: input.index,
            scriptSig: isWitness ? '' : input.script.toString('hex'),
            witness: isWitness
                ? input.witness.map((v) => v.toString('hex'))
                : undefined,
            prevOutScript: outputs[index].output.toString('hex'),
        };
    });
    const txouts = transaction.outs.map((output) => ({
        scriptPubKey: output.script.toString('hex'),
        value: output.value,
    }));

    const [scanTweak, outputEntity] = indexerService.computeScanTweak(
        txins,
        txouts,
    );

    return [scanTweak.toString('hex'), outputEntity];
}

export function transformTransaction(
    transaction: Transaction,
    txid: string,
    blockHash: string,
    blockHeight: number,
    outputs: Payment[],
    indexerService: IndexerService,
): EntityTransaction {
    const entityTransaction = new EntityTransaction();
    entityTransaction.blockHash = blockHash;
    entityTransaction.blockHeight = blockHeight;
    entityTransaction.isSpent = false;
    [entityTransaction.scanTweak, entityTransaction.outputs] =
        generateScanTweak(transaction, outputs, indexerService);
    entityTransaction.id = txid;
    return entityTransaction;
}

export const readVarInt = (data: Buffer, cursor: number): number => {
    const firstByte = data.readUInt8(cursor);
    if (firstByte < 0xfd) return firstByte;
    else if (firstByte === 0xfd) return data.readUInt16LE(cursor + 1);
    else if (firstByte === 0xfe) return data.readUInt32LE(cursor + 1);
    else return Number(data.readBigUInt64LE(cursor + 1));
};

export interface SilentBlockTransaction {
    txid: string;
    outputs: {
        value: number;
        pubkey: string;
        vout: number;
    }[];
    scanTweak: string;
}

export const btcToSats = (amount: number): number => {
    return currency(amount, { precision: 8 }).multiply(SATS_PER_BTC).value;
};
