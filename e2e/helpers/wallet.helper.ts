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
import { BitcoinRPCUtil } from '@e2e/helpers/rpc.helper';

initEccLib(ecc);

export type UTXO = {
    txid: string;
    vout: number;
    value: number;
    rawTx: string;
};

export type SentTransactionDetails = {
    transaction: Transaction;
    txid: string;
    blockhash: string;
};

export class WalletHelper {
    private readonly root: BIP32Interface;
    private readonly bitcoinRPCUtil: BitcoinRPCUtil;

    constructor() {
        this.root = fromSeed(randomBytes(64), networks.regtest);
        this.bitcoinRPCUtil = new BitcoinRPCUtil();
    }

    async initializeWallet() {
        await this.bitcoinRPCUtil.createWallet('test_wallet');
        await this.bitcoinRPCUtil.loadWallet('test_wallet');
        // ensures 5000 BTC are initially available
        await this.mineBlock(200);
    }

    async getBlockCount() {
        return this.bitcoinRPCUtil.getBlockCount();
    }

    async mineBlock(numOfBlocks: number): Promise<string[]> {
        const walletAddress = await this.bitcoinRPCUtil.getNewAddress();
        return this.bitcoinRPCUtil.mineToAddress(numOfBlocks, walletAddress);
    }

    async addFundToUTXO(payment: Payment, amount): Promise<UTXO> {
        const txid = await this.bitcoinRPCUtil.sendToAddress(
            payment.address,
            amount,
        );

        for (let vout = 0; vout < 2; vout++) {
            const utxo = await this.bitcoinRPCUtil.getTxOut(txid, vout);
            if (
                utxo &&
                utxo.scriptPubKey &&
                utxo.scriptPubKey.address === payment.address
            ) {
                return {
                    txid,
                    vout: vout,
                    value: btcToSats(utxo.value),
                    rawTx: await this.bitcoinRPCUtil.getRawTransaction(txid),
                };
            }
        }

        throw new Error(
            `Cannot find transaction for txid: ${txid}, address: ${payment.address}`,
        );
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

    async craftAndSendTransaction(
        utxos: UTXO[],
        taprootOutput: Payment,
        outputValue: number,
        fee: number,
    ): Promise<SentTransactionDetails> {
        const psbt = new Psbt({ network: networks.regtest });

        utxos.forEach((utxo) => {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(utxo.rawTx, 'hex'),
            });
        });

        const totalInputValue = utxos.reduce(
            (acc, utxo) => acc + utxo.value,
            0,
        );

        if (totalInputValue < btcToSats(outputValue) + btcToSats(fee)) {
            throw new Error('Insufficient funds');
        }

        psbt.addOutput({
            address: taprootOutput.address,
            tapInternalKey: taprootOutput.internalPubkey,
            value: btcToSats(outputValue),
        });

        // Sign the inputs with the corresponding private keys
        utxos.forEach((_, index) => {
            const keyPair = this.root.derivePath(`m/84'/0'/0'/0/${index}`);
            psbt.signInput(index, keyPair);
        });

        psbt.finalizeAllInputs();

        const transaction = psbt.extractTransaction(true);

        const txid = await this.bitcoinRPCUtil.sendRawTransaction(
            transaction.toHex(),
        );
        const blockhash = (await this.mineBlock(1))[0];

        return { transaction, txid, blockhash };
    }
}
