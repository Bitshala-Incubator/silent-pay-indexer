import { BIP32Interface, fromSeed } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import {
    initEccLib,
    payments,
    Psbt,
    networks,
    Payment,
    Transaction,
    crypto,
} from 'bitcoinjs-lib';
import { btcToSats } from '@e2e/helpers/common.helper';
import { randomBytes } from 'crypto';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import { BitcoinRPCUtil } from '@e2e/helpers/rpc.helper';
import { assert } from 'console';
import { ECPairFactory } from 'ecpair';

initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export enum AddressType {
    P2WPKH = 'P2WPKH',
    P2TR = 'P2TR',
    P2PKH = 'P2PKH',
    P2SH_P2WPKH = 'P2SH_P2WPKH',
}

export type UTXO = {
    txid: string;
    vout: number;
    value: number;
    rawTx: string;
    addressType: AddressType;
    index: number;
};

export class WalletHelper {
    private root: BIP32Interface;
    private bitcoinRPCUtil: BitcoinRPCUtil;
    private spendableAmount = 0;
    private lastAcceptableBlock = 209_999;
    private spendableAddress: string;
    public currentBlockCount = 0;
    constructor() {
        this.root = fromSeed(randomBytes(64), networks.regtest);
        this.bitcoinRPCUtil = new BitcoinRPCUtil();
        initEccLib(ecc);
    }

    async initializeSpendableAmount() {
        await this.bitcoinRPCUtil.createWallet('test_wallet');
        await this.bitcoinRPCUtil.loadWallet('test_wallet');
        this.spendableAddress = await this.bitcoinRPCUtil.getNewAddress();
        await this.bitcoinRPCUtil.mineToAddress(101, this.spendableAddress);
        this.spendableAmount += 50;
        this.currentBlockCount += 101;
    }

    async ensureAmountAvailable(amount: number) {
        assert(
            this.currentBlockCount < this.lastAcceptableBlock,
            'reward cant be less than 50',
        );
        if (this.spendableAmount - amount < 0) {
            this.mineBlock();
            return this.ensureAmountAvailable(amount);
        }
    }

    async mineBlock(): Promise<string> {
        const blockhash = (
            await this.bitcoinRPCUtil.mineToAddress(1, this.spendableAddress)
        )[0];
        this.spendableAmount += 50;
        this.currentBlockCount += 1;
        return blockhash;
    }

    async addAmountToAddress(
        payment: Payment,
        amount: number,
        addressType: AddressType,
        index: number,
    ): Promise<UTXO> {
        this.ensureAmountAvailable(amount);

        const txid = await this.bitcoinRPCUtil.sendToAddress(
            payment.address,
            amount,
        );

        await this.mineBlock();

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
                    addressType,
                    index,
                };
            }
        }

        throw new Error('cant find transaction');
    }

    generateAddresses(count: number, type: AddressType): Payment[] {
        const outputs: Payment[] = [];
        for (let i = 0; i < count; i++) {
            const child = this.root.derivePath(getDerivationPath(type, i));
            let output: Payment;

            switch (type) {
                case AddressType.P2WPKH:
                    output = payments.p2wpkh({
                        pubkey: child.publicKey,
                        network: networks.regtest,
                    });
                    break;
                case AddressType.P2TR:
                    output = payments.p2tr({
                        internalPubkey: toXOnly(child.publicKey),
                        network: networks.regtest,
                    });
                    break;
                case AddressType.P2PKH:
                    output = payments.p2pkh({
                        pubkey: child.publicKey,
                        network: networks.regtest,
                    });
                    break;
                case AddressType.P2SH_P2WPKH:
                    const p2wpkh = payments.p2wpkh({
                        pubkey: child.publicKey,
                        network: networks.regtest,
                    });
                    output = payments.p2sh({
                        redeem: p2wpkh,
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

    async craftAndSpendTransaction(
        utxos: UTXO[],
        output: Payment,
        outputValue: number,
        fee: number,
    ): Promise<[Transaction, string, string]> {
        const psbt = new Psbt({ network: networks.regtest });
        utxos.forEach((utxo) => {
            const keyPair = this.root.derivePath(
                getDerivationPath(utxo.addressType, utxo.index),
            );
            const input: any = {
                hash: utxo.txid,
                index: utxo.vout,
            };
            switch (utxo.addressType) {
                case AddressType.P2SH_P2WPKH:
                    const p2wpkh = payments.p2wpkh({
                        pubkey: keyPair.publicKey,
                        network: networks.regtest,
                    });
                    const p2sh = payments.p2sh({
                        redeem: p2wpkh,
                        network: networks.regtest,
                    });
                    input.witnessUtxo = {
                        script: p2sh.output,
                        value: utxo.value,
                    };
                    input.redeemScript = p2sh.redeem.output;
                    break;
                case AddressType.P2WPKH:
                    input.witnessUtxo = {
                        script: payments.p2wpkh({
                            pubkey: keyPair.publicKey,
                            network: networks.regtest,
                        }).output,
                        value: utxo.value,
                    };
                    break;
                case AddressType.P2PKH:
                    input.nonWitnessUtxo = Buffer.from(utxo.rawTx, 'hex');
                    break;
                case AddressType.P2TR:
                    input.witnessUtxo = {
                        script: payments.p2tr({
                            internalPubkey: toXOnly(keyPair.publicKey),
                            network: networks.regtest,
                        }).output,
                        value: utxo.value,
                    };
                    input.tapInternalKey = toXOnly(keyPair.publicKey);
                    break;
            }
            psbt.addInput(input);
        });

        const totalInputValue = utxos.reduce(
            (acc, utxo) => acc + utxo.value,
            0,
        );

        if (totalInputValue < btcToSats(outputValue) + btcToSats(fee)) {
            throw new Error('Insufficient funds');
        }

        psbt.addOutput({
            address: output.address,
            tapInternalKey: output.internalPubkey,
            value: btcToSats(outputValue),
        });

        utxos.forEach((utxo, index) => {
            let keyPair: any = this.root.derivePath(
                getDerivationPath(utxo.addressType, utxo.index),
            );

            if (utxo.addressType === AddressType.P2TR) {
                keyPair = createTaprootKeyPair(keyPair);
            }
            psbt.signInput(index, keyPair);
        });

        psbt.finalizeAllInputs();

        const transaction = psbt.extractTransaction(true);

        const txid = await this.bitcoinRPCUtil.sendRawTransaction(
            transaction.toHex(),
        );
        const blockHash = await this.mineBlock();

        return [transaction, txid, blockHash];
    }
}

function getDerivationPath(addressType: AddressType, index: number): string {
    switch (addressType) {
        case AddressType.P2PKH:
            return `m/44'/0'/0'/0/${index}`;
        case AddressType.P2SH_P2WPKH:
            return `m/49'/0'/0'/0/${index}`;
        case AddressType.P2WPKH:
            return `m/84'/0'/0'/0/${index}`;
        case AddressType.P2TR:
            return `m/86'/0'/0'/0/${index}`;
        default:
            throw new Error('Unsupported address type');
    }
}

function createTaprootKeyPair(
    keyPair: BIP32Interface,
    network = networks.regtest,
) {
    const taprootKeyPair = ECPair.fromPrivateKey(keyPair.privateKey, {
        compressed: true,
        network: network,
    });

    const tweakedTaprootKey = taprootKeyPair.tweak(
        crypto.taggedHash('TapTweak', toXOnly(keyPair.publicKey)),
    );

    return tweakedTaprootKey;
}
