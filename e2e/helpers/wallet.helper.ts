import { BIP32Interface, fromSeed } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import {
    initEccLib,
    payments,
    Psbt,
    networks,
    Payment,
    Transaction,
} from 'bitcoinjs-lib';
import { btcToSats } from '@e2e/helpers/common.helper';
import { randomBytes } from 'crypto';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';

initEccLib(ecc);

export type UTXO = {
    txid: string;
    vout: number;
    value: number;
    rawTx: string;
};

export class WalletHelper {
    private root: BIP32Interface;

    constructor() {
        this.root = fromSeed(randomBytes(64), networks.regtest);
    }

    generateAddresses(count: number, type: 'p2wpkh' | 'p2tr'): Payment[] {
        const outputs: Payment[] = [];
        for (let i = 0; i < count; i++) {
            const path = `m/84'/0'/0'/0/${i}`;
            const child = this.root.derivePath(path);
            let output: Payment;

            switch (type) {
                case 'p2wpkh':
                    output = payments.p2wpkh({
                        pubkey: child.publicKey,
                        network: networks.regtest,
                    });
                    break;
                case 'p2tr':
                    output = payments.p2tr({
                        internalPubkey: toXOnly(child.publicKey),
                        network: networks.regtest,
                    });
                    break;
                default:
                    throw new Error('Unsupported address type');
            }

            outputs.push(output);
        }
        return outputs;
    }

    /**
     * Craft and sign a transaction sending 5.999 BTC to the provided Taproot address.
     *
     * @param utxos - Array of UTXOs to spend from.
     * @param taprootOutput - The Taproot output to send to.
     * @returns {Transaction} The raw signed transaction.
     */
    craftTransaction(utxos: UTXO[], taprootOutput: Payment): Transaction {
        const psbt = new Psbt({ network: networks.regtest });

        utxos.forEach((utxo) => {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(utxo.rawTx, 'hex'),
            });
        });

        // Add the output to the Taproot address (6 BTC)
        const totalInputValue = utxos.reduce(
            (acc, utxo) => acc + utxo.value,
            0,
        );

        const outputValue = btcToSats(5.999);
        const fee = btcToSats(0.001);

        if (totalInputValue < outputValue + fee) {
            throw new Error('Insufficient funds');
        }

        psbt.addOutput({
            address: taprootOutput.address,
            tapInternalKey: taprootOutput.internalPubkey,
            value: outputValue,
        });

        // Sign the inputs with the corresponding private keys
        utxos.forEach((utxo, index) => {
            const keyPair = this.root.derivePath(`m/84'/0'/0'/0/${index}`);
            psbt.signInput(index, keyPair);
        });

        psbt.finalizeAllInputs();

        return psbt.extractTransaction(true);
    }
}
