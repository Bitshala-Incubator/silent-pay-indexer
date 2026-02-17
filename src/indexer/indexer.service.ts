import { Transaction } from '@/transactions/transaction.entity';
import { TransactionOutput as TransactionOutputEntity } from '@/transactions/transaction-output.entity';
import { createTaggedHash, extractPubKeyFromScript } from '@/common/common';
import { publicKeyCombine, publicKeyTweakMul } from 'secp256k1';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
    hexToUint8Array,
    concatUint8Arrays,
    uint8ArrayToHex,
    compareUint8Arrays,
    createView,
    reverseUint8Array,
} from '@/common/uint8array';

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

export type ScanTweakAndOutputs = {
    scanTweak: Uint8Array;
    eligibleOutputs: TransactionOutputEntity[];
};

@Injectable()
export class IndexerService {
    async index(
        txid: string,
        vin: TransactionInput[],
        vout: TransactionOutput[],
        blockHeight: number,
        blockHash: string,
        blockTime: number,
        manager: EntityManager,
    ): Promise<void> {
        const scanResult = this.deriveOutputsAndComputeScanTweak(vin, vout);
        if (scanResult !== null) {
            const { scanTweak, eligibleOutputs: outputs } = scanResult;
            const transaction = new Transaction();
            transaction.id = txid;
            transaction.blockHeight = blockHeight;
            transaction.blockHash = blockHash;
            transaction.blockTime = blockTime;
            transaction.scanTweak = uint8ArrayToHex(scanTweak);

            for (const output of outputs) {
                output.transaction = transaction;
            }

            await manager.save(Transaction, transaction);
            await manager.save(TransactionOutputEntity, outputs, {
                chunk: 500,
            });
        }
    }

    public deriveOutputsAndComputeScanTweak(
        vin: TransactionInput[],
        vout: TransactionOutput[],
    ): ScanTweakAndOutputs | null {
        const eligibleOutputs: TransactionOutputEntity[] = [];

        // verify if the transaction contains at least one BIP341 P2TR output
        // this output could be a potential silent pay
        let n = 0;
        for (const output of vout) {
            if (this.isP2TR(output.scriptPubKey)) {
                const outputEntity = TransactionOutputEntity.fromOutput(
                    output,
                    n,
                );

                eligibleOutputs.push(outputEntity);
            }
            n++;
        }

        if (eligibleOutputs.length === 0) return null;

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
        const pubKeys: Uint8Array[] = [];
        for (const input of vin) {
            const pubKey = extractPubKeyFromScript(
                hexToUint8Array(input.prevOutScript),
                hexToUint8Array(input.scriptSig),
                input.witness?.map((w) => hexToUint8Array(w)),
            );
            if (pubKey) pubKeys.push(pubKey);
        }

        if (pubKeys.length === 0) return null;

        const smallestOutpoint = this.getSmallestOutpoint(vin);
        const sumOfPublicKeys = new Uint8Array(
            publicKeyCombine(pubKeys, true),
        );
        // let sumOfPublicKeys: Buffer;
        // try {
        //     sumOfPublicKeys = Buffer.from(publicKeyCombine(pubKeys, true));
        // } catch (error) {
        //     // if sumOfPublicKeys is the point at infinity(not valid), skip the transaction
        //     // https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki#scanning
        //     if (error.message === 'The sum of the public keys is not valid') {
        //         return null;
        //     }
        //     throw error;
        // }

        const inputHash = createTaggedHash(
            'BIP0352/Inputs',
            concatUint8Arrays([smallestOutpoint, sumOfPublicKeys]),
        );

        // A * inputHash
        const scanTweak = new Uint8Array(
            publicKeyTweakMul(sumOfPublicKeys, inputHash, true),
        );

        return { scanTweak, eligibleOutputs };
    }

    private isP2TR(spk: string): boolean {
        return !!spk.match(/^5120[0-9a-fA-F]{64}$/);
    }

    private getSmallestOutpoint(vins: TransactionInput[]): Uint8Array {
        const outpoints = vins.map((vin) => {
            const n = new Uint8Array(4);
            const view = createView(n);
            view.setUint32(0, vin.vout, true); // true = little endian
            return concatUint8Arrays([
                reverseUint8Array(hexToUint8Array(vin.txid)),
                n,
            ]);
        });

        let smallest = outpoints[0];
        for (const outpoint of outpoints) {
            if (compareUint8Arrays(outpoint, smallest) < 0) smallest = outpoint;
        }
        return smallest;
    }
}
