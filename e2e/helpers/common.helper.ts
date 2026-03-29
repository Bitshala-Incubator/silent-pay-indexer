import { Payment, Transaction } from 'bitcoinjs-lib';
import { IndexerService } from '@/indexer/indexer.service';
import { Transaction as TransactionEntity } from '@/transactions/transaction.entity';
import { TransactionOutput } from '@/transactions/transaction-output.entity';
import { uint8ArrayToHex, createView } from '@/common/uint8array';

export function generateScanTweakAndOutputEntity(
    transaction: Transaction,
    outputs: Payment[],
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
            prevOutScript: outputs[index].redeem
                ? outputs[index].redeem.output.toString('hex')
                : outputs[index].output.toString('hex'),
        };
    });
    const txouts = transaction.outs.map((output) => ({
        scriptPubKey: output.script.toString('hex'),
        value: output.value,
    }));

    const { scanTweak, eligibleOutputs } =
        new IndexerService().deriveOutputsAndComputeScanTweak(txins, txouts);

    return [uint8ArrayToHex(scanTweak), eligibleOutputs];
}

export function transactionToEntity(
    transaction: Transaction,
    txid: string,
    blockHash: string,
    blockHeight: number,
    outputs: Payment[],
): TransactionEntity {
    const entityTransaction = new TransactionEntity();
    entityTransaction.blockHash = blockHash;
    entityTransaction.blockHeight = blockHeight;
    [entityTransaction.scanTweak, entityTransaction.outputs] =
        generateScanTweakAndOutputEntity(transaction, outputs);
    entityTransaction.id = txid;
    return entityTransaction;
}

export const readVarInt = (data: Uint8Array, cursor: number): number => {
    if (cursor >= data.length) {
        throw new Error('readVarInt: cursor out of bounds');
    }
    const view = createView(data, cursor);
    const firstByte = view.getUint8(0);
    if (firstByte < 0xfd) return firstByte;
    else if (firstByte === 0xfd) {
        if (cursor + 3 > data.length) {
            throw new Error('readVarInt: insufficient data for uint16');
        }
        return view.getUint16(1, true); // true = little endian
    } else if (firstByte === 0xfe) {
        if (cursor + 5 > data.length) {
            throw new Error('readVarInt: insufficient data for uint32');
        }
        return view.getUint32(1, true);
    } else {
        if (cursor + 9 > data.length) {
            throw new Error('readVarInt: insufficient data for uint64');
        }
        return Number(view.getBigUint64(1, true));
    }
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
