import { createHash } from 'crypto';
import { publicKeyVerify } from 'secp256k1';
import { NUMS_H } from '@/common/constants';

export const camelToSnakeCase = (inputString: string) => {
    return inputString
        .split('.')
        .map((string) => {
            return string.replace(/[A-Z]/g, (letter) => `_${letter}`);
        })
        .join('_')
        .toUpperCase();
};

const verifyPubKey = (pubKey: Buffer): boolean => {
    return pubKey.length === 33 && publicKeyVerify(pubKey);
};

const hash160 = (buffer: Buffer): Buffer => {
    const sha256 = createHash('sha256').update(buffer).digest();
    return createHash('ripemd160').update(sha256).digest();
};

export const createTaggedHash = (tag: string, buffer: Buffer): Buffer => {
    const tagHash = createHash('sha256').update(tag, 'utf8').digest();
    return createHash('sha256')
        .update(tagHash)
        .update(tagHash)
        .update(buffer)
        .digest();
};

export const extractPubKeyFromScript = (
    scriptPubKey: Buffer,
    scriptSig: Buffer,
    witness: Buffer[] = [],
): Buffer | null => {
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
            if (hash160(pubKey).equals(pubKeyHash) && publicKeyVerify(pubKey))
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
                if (internalKey.equals(NUMS_H)) return null;
            }

            const pubKey = Buffer.concat([
                Buffer.from([0x02]),
                scriptPubKey.subarray(2),
            ]);
            if (verifyPubKey(pubKey)) return pubKey;
        }
    }

    return null;
};

export const encodeVarInt = (
    value: number,
    buffer: Buffer,
    offset = 0,
): number => {
    if (value < 0xfd) {
        buffer.writeUInt8(value, offset);
        return offset + 1;
    } else if (value <= 0xffff) {
        buffer.writeUInt8(0xfd, offset);
        buffer.writeUInt16LE(value, offset + 2);
        return offset + 3;
    } else if (value <= 0xffffffff) {
        buffer.writeUInt8(0xfe, offset);
        buffer.writeUInt32LE(value, offset + 4);
        return offset + 5;
    } else {
        buffer.writeUInt8(0xff, offset);
        buffer.writeBigUInt64LE(BigInt(value), offset + 8);
        return offset + 9;
    }
};

export const varIntSize = (value: number): number => {
    if (value < 0xfd) return 1;
    else if (value <= 0xffff) return 3;
    else if (value <= 0xffffffff) return 5;
    else return 9;
};
