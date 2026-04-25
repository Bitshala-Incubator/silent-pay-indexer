// Key prefixes for namespace separation in LMDB
const PREFIX = {
    TX: Buffer.from('tx:'),
    OUTPUT: Buffer.from('out:'),
    HEIGHT_IDX: Buffer.from('idx:h:'),
    HASH_IDX: Buffer.from('idx:bh:'),
    TIME_IDX: Buffer.from('idx:bt:'),
    UNSPENT_IDX: Buffer.from('idx:us:'),
    BLOCK_STATE: Buffer.from('bs:'),
    OP_STATE: Buffer.from('os:'),
} as const;

// --- Key encoders ---

export function encodeTxKey(txid: string): Buffer {
    return Buffer.concat([PREFIX.TX, Buffer.from(txid, 'hex')]);
}

export function encodeOutputKey(txid: string, vout: number): Buffer {
    const voutBuf = Buffer.alloc(4);
    voutBuf.writeUInt32BE(vout);
    return Buffer.concat([PREFIX.OUTPUT, Buffer.from(txid, 'hex'), voutBuf]);
}

export function encodeHeightIndexKey(height: number, txid: string): Buffer {
    const heightBuf = Buffer.alloc(4);
    heightBuf.writeUInt32BE(height);
    return Buffer.concat([
        PREFIX.HEIGHT_IDX,
        heightBuf,
        Buffer.from(txid, 'hex'),
    ]);
}

export function encodeHashIndexKey(blockHash: string, txid: string): Buffer {
    return Buffer.concat([
        PREFIX.HASH_IDX,
        Buffer.from(blockHash, 'hex'),
        Buffer.from(txid, 'hex'),
    ]);
}

export function encodeTimeIndexKey(
    blockTime: number,
    blockHeight: number,
): Buffer {
    const timeBuf = Buffer.alloc(4);
    timeBuf.writeUInt32BE(blockTime);
    const heightBuf = Buffer.alloc(4);
    heightBuf.writeUInt32BE(blockHeight);
    return Buffer.concat([PREFIX.TIME_IDX, timeBuf, heightBuf]);
}

export function encodeUnspentIndexKey(txid: string, vout: number): Buffer {
    const voutBuf = Buffer.alloc(4);
    voutBuf.writeUInt32BE(vout);
    return Buffer.concat([
        PREFIX.UNSPENT_IDX,
        Buffer.from(txid, 'hex'),
        voutBuf,
    ]);
}

export function encodeBlockStateKey(height: number): Buffer {
    const heightBuf = Buffer.alloc(4);
    heightBuf.writeUInt32BE(height);
    return Buffer.concat([PREFIX.BLOCK_STATE, heightBuf]);
}

export function encodeOpStateKey(id: string): Buffer {
    return Buffer.concat([PREFIX.OP_STATE, Buffer.from(id, 'utf8')]);
}

// --- Value encoders ---

export function encodeTxValue(
    blockHeight: number,
    blockHash: string,
    blockTime: number,
    scanTweak: string,
): Buffer {
    const buf = Buffer.alloc(73); // 4 + 32 + 4 + 33
    let offset = 0;
    buf.writeUInt32BE(blockHeight, offset);
    offset += 4;
    Buffer.from(blockHash, 'hex').copy(buf, offset);
    offset += 32;
    buf.writeUInt32BE(blockTime, offset);
    offset += 4;
    Buffer.from(scanTweak, 'hex').copy(buf, offset);
    return buf;
}

export function decodeTxValue(buf: Buffer): {
    blockHeight: number;
    blockHash: string;
    blockTime: number;
    scanTweak: string;
} {
    let offset = 0;
    const blockHeight = buf.readUInt32BE(offset);
    offset += 4;
    const blockHash = buf.subarray(offset, offset + 32).toString('hex');
    offset += 32;
    const blockTime = buf.readUInt32BE(offset);
    offset += 4;
    const scanTweak = buf.subarray(offset, offset + 33).toString('hex');
    return { blockHeight, blockHash, blockTime, scanTweak };
}

export function encodeOutputValue(
    pubKey: string,
    value: number,
    isSpent: boolean,
): Buffer {
    const buf = Buffer.alloc(41); // 32 + 8 + 1
    let offset = 0;
    Buffer.from(pubKey, 'hex').copy(buf, offset);
    offset += 32;
    buf.writeBigUInt64BE(BigInt(value), offset);
    offset += 8;
    buf.writeUInt8(isSpent ? 1 : 0, offset);
    return buf;
}

export function decodeOutputValue(buf: Buffer): {
    pubKey: string;
    value: number;
    isSpent: boolean;
} {
    let offset = 0;
    const pubKey = buf.subarray(offset, offset + 32).toString('hex');
    offset += 32;
    const value = Number(buf.readBigUInt64BE(offset));
    offset += 8;
    const isSpent = buf.readUInt8(offset) === 1;
    return { pubKey, value, isSpent };
}

// --- Key decoders ---

export function decodeTxKey(key: Buffer): string {
    return key.subarray(PREFIX.TX.length).toString('hex');
}

export function decodeOutputKey(key: Buffer): {
    txid: string;
    vout: number;
} {
    const data = key.subarray(PREFIX.OUTPUT.length);
    const txid = data.subarray(0, 32).toString('hex');
    const vout = data.readUInt32BE(32);
    return { txid, vout };
}

export function decodeHeightIndexKey(key: Buffer): {
    height: number;
    txid: string;
} {
    const data = key.subarray(PREFIX.HEIGHT_IDX.length);
    const height = data.readUInt32BE(0);
    const txid = data.subarray(4).toString('hex');
    return { height, txid };
}

export function decodeHashIndexKey(key: Buffer): {
    blockHash: string;
    txid: string;
} {
    const data = key.subarray(PREFIX.HASH_IDX.length);
    const blockHash = data.subarray(0, 32).toString('hex');
    const txid = data.subarray(32).toString('hex');
    return { blockHash, txid };
}

export function decodeTimeIndexKey(key: Buffer): {
    blockTime: number;
    blockHeight: number;
} {
    const data = key.subarray(PREFIX.TIME_IDX.length);
    const blockTime = data.readUInt32BE(0);
    const blockHeight = data.readUInt32BE(4);
    return { blockTime, blockHeight };
}

export function decodeUnspentIndexKey(key: Buffer): {
    txid: string;
    vout: number;
} {
    const data = key.subarray(PREFIX.UNSPENT_IDX.length);
    const txid = data.subarray(0, 32).toString('hex');
    const vout = data.readUInt32BE(32);
    return { txid, vout };
}

export function decodeBlockStateKey(key: Buffer): number {
    return key.readUInt32BE(PREFIX.BLOCK_STATE.length);
}

// --- Range helpers for prefix scans ---

/** Returns the upper bound for a prefix scan (prefix with last byte incremented) */
export function prefixUpperBound(prefix: Buffer): Buffer {
    const upper = Buffer.from(prefix);
    // Increment the last byte. This works because all our prefixes end with ':'
    // which is 0x3A, so incrementing gives 0x3B (';')
    upper[upper.length - 1]++;
    return upper;
}

/** Height index range: all txids at a single block height */
export function singleHeightRange(height: number): {
    gte: Buffer;
    lt: Buffer;
} {
    const heightBuf = Buffer.alloc(4);
    heightBuf.writeUInt32BE(height);
    const gte = Buffer.concat([PREFIX.HEIGHT_IDX, heightBuf]);
    const nextHeightBuf = Buffer.alloc(4);
    nextHeightBuf.writeUInt32BE(height + 1);
    const lt = Buffer.concat([PREFIX.HEIGHT_IDX, nextHeightBuf]);
    return { gte, lt };
}

/** Height index range: all txids across a block height span [start, end] */
export function heightSpanRange(
    startHeight: number,
    endHeight: number,
): { gte: Buffer; lt: Buffer } {
    const startBuf = Buffer.alloc(4);
    startBuf.writeUInt32BE(startHeight);
    const endBuf = Buffer.alloc(4);
    endBuf.writeUInt32BE(endHeight + 1);
    return {
        gte: Buffer.concat([PREFIX.HEIGHT_IDX, startBuf]),
        lt: Buffer.concat([PREFIX.HEIGHT_IDX, endBuf]),
    };
}

/** Hash index range: all txids for a specific block hash */
export function hashIndexRange(blockHash: string): {
    gte: Buffer;
    lt: Buffer;
} {
    const hashBuf = Buffer.from(blockHash, 'hex');
    const gte = Buffer.concat([PREFIX.HASH_IDX, hashBuf]);
    // Next hash: increment last byte of the 32-byte hash
    const nextHashBuf = Buffer.alloc(32);
    hashBuf.copy(nextHashBuf);
    // Add 1 to the hash as a 256-bit number (increment last byte, carry if needed)
    for (let i = 31; i >= 0; i--) {
        if (nextHashBuf[i] < 0xff) {
            nextHashBuf[i]++;
            break;
        }
        nextHashBuf[i] = 0;
    }
    const lt = Buffer.concat([PREFIX.HASH_IDX, nextHashBuf]);
    return { gte, lt };
}

/** Output prefix range: all outputs for a specific txid */
export function outputPrefixRange(txid: string): {
    gte: Buffer;
    lt: Buffer;
} {
    const txidBuf = Buffer.from(txid, 'hex');
    const gte = Buffer.concat([PREFIX.OUTPUT, txidBuf]);
    const nextTxidBuf = Buffer.alloc(32);
    txidBuf.copy(nextTxidBuf);
    for (let i = 31; i >= 0; i--) {
        if (nextTxidBuf[i] < 0xff) {
            nextTxidBuf[i]++;
            break;
        }
        nextTxidBuf[i] = 0;
    }
    const lt = Buffer.concat([PREFIX.OUTPUT, nextTxidBuf]);
    return { gte, lt };
}

/** Unspent index prefix range: all unspent outputs for a specific txid */
export function unspentPrefixRange(txid: string): {
    gte: Buffer;
    lt: Buffer;
} {
    const txidBuf = Buffer.from(txid, 'hex');
    const gte = Buffer.concat([PREFIX.UNSPENT_IDX, txidBuf]);
    const nextTxidBuf = Buffer.alloc(32);
    txidBuf.copy(nextTxidBuf);
    for (let i = 31; i >= 0; i--) {
        if (nextTxidBuf[i] < 0xff) {
            nextTxidBuf[i]++;
            break;
        }
        nextTxidBuf[i] = 0;
    }
    const lt = Buffer.concat([PREFIX.UNSPENT_IDX, nextTxidBuf]);
    return { gte, lt };
}

/** Block state range for reverse iteration (get latest) */
export function blockStateRange(): { gte: Buffer; lt: Buffer } {
    return {
        gte: PREFIX.BLOCK_STATE,
        lt: prefixUpperBound(PREFIX.BLOCK_STATE),
    };
}

/** Time index: seek point for finding first block after a timestamp */
export function timeIndexSeek(timestamp: number): {
    gte: Buffer;
    lt: Buffer;
} {
    const timeBuf = Buffer.alloc(4);
    timeBuf.writeUInt32BE(timestamp + 1);
    return {
        gte: Buffer.concat([PREFIX.TIME_IDX, timeBuf]),
        lt: prefixUpperBound(PREFIX.TIME_IDX),
    };
}
