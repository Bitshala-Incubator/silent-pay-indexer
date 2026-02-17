import { createHash } from 'crypto';
import { publicKeyVerify } from 'secp256k1';
import { NUMS_H, SATS_PER_BTC } from '@/common/constants';
import * as currency from 'currency.js';
import {
    areUint8ArraysEqual,
    createView,
    hexToUint8Array,
    concatUint8Arrays,
} from '@/common/uint8array';

export const camelToSnakeCase = (inputString: string) => {
    return inputString
        .split('.')
        .map((string) => {
            return string.replace(/[A-Z]/g, (letter) => `_${letter}`);
        })
        .join('_')
        .toUpperCase();
};

const verifyPubKey = (pubKey: Uint8Array): boolean => {
    return pubKey.length === 33 && publicKeyVerify(pubKey);
};

const hash160 = (buffer: Uint8Array): Uint8Array => {
    const sha256 = new Uint8Array(createHash('sha256').update(buffer).digest());
    return new Uint8Array(createHash('ripemd160').update(sha256).digest());
};

export const createTaggedHash = (
    tag: string,
    buffer: Uint8Array,
): Uint8Array => {
    const tagHash = new Uint8Array(
        createHash('sha256').update(tag, 'utf8').digest(),
    );
    return new Uint8Array(
        createHash('sha256')
            .update(tagHash)
            .update(tagHash)
            .update(buffer)
            .digest(),
    );
};

export const extractPubKeyFromScript = (
    scriptPubKey: Uint8Array,
    scriptSig: Uint8Array,
    witness: Uint8Array[] = [],
): Uint8Array | null => {
    // P2PKH
    // scriptPubKey: OP_DUP OP_HASH160 OP_PUSHBYTES_20 <20 bytes> OP_EQUALVERIFY OP_CHECKSIG
    if (
        scriptPubKey.length === 25 &&
        scriptPubKey[0] === 0x76 &&
        scriptPubKey[1] === 0xa9 &&
        scriptPubKey[2] === 0x14 &&
        scriptPubKey[23] === 0x88 &&
        scriptPubKey[24] === 0xac
    ) {
        const pubKeyHash = scriptPubKey.subarray(3, 23);
        // we have to do this because P2PKH scriptSig are malleable
        // segwit fixes this
        // a better way to do this would be to parse the scriptSig
        for (let i = scriptSig.length; i >= 33; i--) {
            const pubKey = scriptSig.subarray(i - 33, i);
            if (
                areUint8ArraysEqual(hash160(pubKey), pubKeyHash) &&
                publicKeyVerify(pubKey)
            )
                return pubKey;
        }
    }

    // P2WPKH
    // scriptPubKey: OP_0 OP_PUSHBYTES_20 <20 bytes>
    if (
        scriptPubKey.length === 22 &&
        scriptPubKey[0] === 0x00 &&
        scriptPubKey[1] === 0x14
    ) {
        const pubKey = witness[1];
        if (verifyPubKey(pubKey)) return pubKey;
    }

    // P2SH
    // scriptPubKey: OP_HASH160 OP_PUSHBYTES_20 <20 bytes> OP_EQUAL
    if (
        scriptPubKey.length === 23 &&
        scriptPubKey[0] === 0xa9 &&
        scriptPubKey[1] === 0x14 &&
        scriptPubKey[22] === 0x87
    ) {
        const redeemScript = scriptSig.subarray(1);
        // check if redeemScript is P2WPKH
        if (
            redeemScript.length === 22 &&
            redeemScript[0] === 0x00 &&
            redeemScript[1] === 0x14
        ) {
            const pubKey = witness[1];
            if (verifyPubKey(pubKey)) {
                return pubKey;
            }
        }
    }

    // P2TR
    // scriptPubKey: OP_1 OP_PUSHBYTES_32 <32 bytes>
    if (
        scriptPubKey.length === 34 &&
        scriptPubKey[0] === 0x51 &&
        scriptPubKey[1] === 0x20
    ) {
        if (witness.length >= 1) {
            // remove annex
            if (witness.length > 1 && witness[witness.length - 1][0] === 0x50)
                witness.pop();

            if (witness.length > 1) {
                const controlBlock = witness[witness.length - 1];
                const internalKey = controlBlock.subarray(1, 33);
                if (areUint8ArraysEqual(internalKey, NUMS_H)) return null;
            }

            const pubKey = concatUint8Arrays([
                new Uint8Array([0x02]),
                scriptPubKey.subarray(2),
            ]);
            if (verifyPubKey(pubKey)) return pubKey;
        }
    }

    return null;
};

export const encodeVarInt = (
    value: number,
    buffer: Uint8Array,
    offset = 0,
): number => {
    const view = createView(buffer, offset);
    if (value < 0xfd) {
        view.setUint8(offset, value);
        return offset + 1;
    } else if (value <= 0xffff) {
        view.setUint8(offset, 0xfd);
        view.setUint16(1, value, true); // true = little endian
        return offset + 3;
    } else if (value <= 0xffffffff) {
        view.setUint8(0, 0xfe);
        view.setUint32(1, value, true);
        return offset + 5;
    } else {
        view.setUint8(0, 0xff);
        view.setBigUint64(1, BigInt(value), true);
        return offset + 9;
    }
};

export const varIntSize = (value: number): number => {
    if (value < 0xfd) return 1;
    else if (value <= 0xffff) return 3;
    else if (value <= 0xffffffff) return 5;
    else return 9;
};

export const btcToSats = (amount: number): number => {
    return currency(currency(amount, { precision: 8 }).multiply(SATS_PER_BTC), {
        precision: 0,
    }).value;
};
