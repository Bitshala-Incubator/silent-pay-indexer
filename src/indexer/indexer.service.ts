import {
    Transaction,
    TransactionOutput as TransactionOutputEntity,
} from '@/transactions/transaction.entity';
import { createTaggedHash, extractPubKeyFromScript } from '@/common/common';
import { publicKeyCombine, publicKeyTweakMul } from 'secp256k1';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

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

@Injectable()
export class IndexerService {
    async index(
        txid: string,
        vin: TransactionInput[],
        vout: TransactionOutput[],
        blockHeight: number,
        blockHash: string,
        manager: EntityManager,
    ): Promise<void> {
        const scanResult = this.computeScanTweak(vin, vout);
        if (scanResult !== null) {
            const [scanTweak, eligibleOutputPubKeys] = scanResult;
            const transaction = new Transaction();
            transaction.id = txid;
            transaction.blockHeight = blockHeight;
            transaction.blockHash = blockHash;
            transaction.scanTweak = scanTweak.toString('hex');
            transaction.outputs = eligibleOutputPubKeys;
            transaction.isSpent = false;

            await manager.save(Transaction, transaction);
        }
    }

    public computeScanTweak(
        vin: TransactionInput[],
        vout: TransactionOutput[],
    ): [Buffer, TransactionOutputEntity[]] | null {
        const eligibleOutputPubKeys: TransactionOutputEntity[] = [];

        // verify if the transaction contains at least one BIP341 P2TR output
        // this output could be a potential silent pay
        let n = 0;
        for (const output of vout) {
            if (this.isP2TR(output.scriptPubKey)) {
                eligibleOutputPubKeys.push({
                    pubKey: output.scriptPubKey.substring(4),
                    value: output.value,
                    vout: n,
                });
            }
            n++;
        }

        if (eligibleOutputPubKeys.length === 0) return null;

        // verify that the transaction does not spend an output with SegWit version > 1
        // this would make the transaction invalid for silent payment v0
        for (const input of vin) {
            // grab the first op code of the prevOutScript
            const firstOpCode = parseInt(input.prevOutScript.slice(0, 2), 16);
            // if the first op code is in the range OP_2-OP_16 (0x52-0x60)
            // then the transaction is ineligible
            if (0x52 <= firstOpCode && firstOpCode <= 0x60) return null;
        }

        // extract the input public keys from the transaction
        const pubKeys: Buffer[] = [];
        for (const input of vin) {
            const pubKey = extractPubKeyFromScript(
                Buffer.from(input.prevOutScript, 'hex'),
                Buffer.from(input.scriptSig, 'hex'),
                input.witness?.map((w) => Buffer.from(w, 'hex')),
            );
            if (pubKey) pubKeys.push(pubKey);
        }

        if (pubKeys.length === 0) return null;

        const smallestOutpoint = this.getSmallestOutpoint(vin);
        const sumOfPublicKeys = Buffer.from(publicKeyCombine(pubKeys, true));

        const inputHash = createTaggedHash(
            'BIP0352/Inputs',
            Buffer.concat([smallestOutpoint, sumOfPublicKeys]),
        );

        // A * inputHash
        const scanTweak = Buffer.from(
            publicKeyTweakMul(sumOfPublicKeys, inputHash, true),
        );

        return [scanTweak, eligibleOutputPubKeys];
    }

    private isP2TR(spk: string): boolean {
        return !!spk.match(/^5120[0-9a-fA-F]{64}$/);
    }

    private getSmallestOutpoint(vins: TransactionInput[]): Buffer {
        const outpoints = vins.map((vin) => {
            const n = Buffer.alloc(4);
            n.writeUInt32LE(vin.vout);
            return Buffer.concat([Buffer.from(vin.txid, 'hex').reverse(), n]);
        });

        let smallest = outpoints[0];
        for (const outpoint of outpoints) {
            if (outpoint.compare(smallest) < 0) smallest = outpoint;
        }
        return smallest;
    }
}
