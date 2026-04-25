import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { open, RootDatabase } from 'lmdb';
import { BatchWriter } from '@/storage/batch-writer';
import {
    TransactionData,
    OutputData,
    BlockStateData,
    OperationStateData,
} from '@/storage/interfaces';
import {
    encodeTxKey,
    encodeTxValue,
    decodeTxValue,
    encodeOutputKey,
    encodeOutputValue,
    decodeOutputKey,
    decodeOutputValue,
    encodeHeightIndexKey,
    decodeHeightIndexKey,
    encodeHashIndexKey,
    encodeTimeIndexKey,
    decodeTimeIndexKey,
    encodeUnspentIndexKey,
    encodeBlockStateKey,
    decodeBlockStateKey,
    decodeHashIndexKey,
    decodeUnspentIndexKey,
    encodeOpStateKey,
    singleHeightRange,
    heightSpanRange,
    hashIndexRange,
    outputPrefixRange,
    unspentPrefixRange,
    blockStateRange,
    timeIndexSeek,
} from '@/storage/key-encoding';

@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
    private db: RootDatabase<Buffer, Buffer>;
    private readonly logger = new Logger(StorageService.name);

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        const dbPath = this.configService.get<string>('db.path');
        const mapSize = this.configService.get<number>('db.mapSize');
        this.logger.log(`Opening LMDB at ${dbPath}`);
        this.db = open({
            path: dbPath,
            keyEncoding: 'binary',
            encoding: 'binary',
            compression: true,
            mapSize,
        });
    }

    async onModuleDestroy(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.logger.log('LMDB closed');
        }
    }

    createBatch(): BatchWriter {
        return new BatchWriter(this.db);
    }

    // --- Low-level helpers ---

    private get(key: Buffer): Buffer | null {
        const val = this.db.getBinary(key);
        return val ? Buffer.from(val) : null;
    }

    private collectRange<T>(
        opts: { gte: Buffer; lt: Buffer; reverse?: boolean; limit?: number },
        decode: (key: Buffer, value: Buffer) => T,
    ): T[] {
        const results: T[] = [];
        // LMDB-js positions the cursor at `start` and walks toward `end`,
        // so reverse iteration needs the bounds swapped (high → low).
        const range = this.db.getRange({
            start: opts.reverse ? opts.lt : opts.gte,
            end: opts.reverse ? opts.gte : opts.lt,
            reverse: opts.reverse,
            limit: opts.limit,
        });
        for (const { key, value } of range) {
            results.push(
                decode(Buffer.from(key as any), Buffer.from(value as any)),
            );
        }
        return results;
    }

    // --- Transaction reads ---

    async getTransactionByTxid(
        txid: string,
        filterSpent: boolean,
    ): Promise<TransactionData | null> {
        const txBuf = this.get(encodeTxKey(txid));
        if (!txBuf) return null;

        const tx = decodeTxValue(txBuf);
        const outputs = this.getOutputsForTxid(txid, filterSpent);
        if (outputs.length === 0) return null;

        return {
            id: txid,
            ...tx,
            outputs,
        };
    }

    async getTransactionsByBlockHeight(
        height: number,
        filterSpent: boolean,
    ): Promise<TransactionData[]> {
        const range = singleHeightRange(height);
        const txids = this.collectRange(
            range,
            (key) => decodeHeightIndexKey(key).txid,
        );
        return this.fetchTransactions(txids, filterSpent);
    }

    async getTransactionsByBlockHeightRange(
        startHeight: number,
        endHeight: number,
        filterSpent: boolean,
    ): Promise<TransactionData[]> {
        const range = heightSpanRange(startHeight, endHeight);
        const txids = this.collectRange(
            range,
            (key) => decodeHeightIndexKey(key).txid,
        );
        return this.fetchTransactions(txids, filterSpent);
    }

    async getTransactionsByBlockHash(
        blockHash: string,
        filterSpent: boolean,
    ): Promise<TransactionData[]> {
        const range = hashIndexRange(blockHash);
        const txids = this.collectRange(
            range,
            (key) => decodeHashIndexKey(key).txid,
        );
        return this.fetchTransactions(txids, filterSpent);
    }

    async getBlockHeightByTimestamp(timestamp: number): Promise<number | null> {
        const range = timeIndexSeek(timestamp);
        const results = this.collectRange(
            { ...range, limit: 1 },
            (key) => decodeTimeIndexKey(key).blockHeight,
        );
        return results.length > 0 ? results[0] : null;
    }

    // --- Block state ---

    async getCurrentBlockState(): Promise<BlockStateData | null> {
        const range = blockStateRange();
        const results = this.collectRange(
            { ...range, reverse: true, limit: 1 },
            (key, value) => ({
                blockHeight: decodeBlockStateKey(key),
                blockHash: value.toString('hex'),
            }),
        );
        return results.length > 0 ? results[0] : null;
    }

    // --- Operation state ---

    async getOperationState(id: string): Promise<OperationStateData | null> {
        const buf = this.get(encodeOpStateKey(id));
        if (!buf) return null;
        return {
            id,
            state: JSON.parse(buf.toString('utf8')),
        };
    }

    // --- Batch write operations ---

    /**
     * Saves a transaction and its outputs to the batch.
     * Returns a map of output keys ("txid:vout") to output data,
     * for use with markOutputsSpent's pendingOutputs parameter.
     */
    saveTransaction(
        batch: BatchWriter,
        tx: TransactionData,
    ): Map<string, { pubKey: string; value: number }> {
        const pendingOutputs = new Map<
            string,
            { pubKey: string; value: number }
        >();
        // Primary transaction data
        batch.put(
            encodeTxKey(tx.id),
            encodeTxValue(
                tx.blockHeight,
                tx.blockHash,
                tx.blockTime,
                tx.scanTweak,
            ),
        );

        // Outputs
        for (const out of tx.outputs) {
            batch.put(
                encodeOutputKey(tx.id, out.vout),
                encodeOutputValue(out.pubKey, out.value, out.isSpent),
            );
            pendingOutputs.set(`${tx.id}:${out.vout}`, {
                pubKey: out.pubKey,
                value: out.value,
            });
            // Unspent index (new outputs are always unspent)
            if (!out.isSpent) {
                batch.put(
                    encodeUnspentIndexKey(tx.id, out.vout),
                    Buffer.alloc(0),
                );
            }
        }

        // Secondary indexes
        batch.put(encodeHeightIndexKey(tx.blockHeight, tx.id), Buffer.alloc(0));
        batch.put(encodeHashIndexKey(tx.blockHash, tx.id), Buffer.alloc(0));
        batch.put(
            encodeTimeIndexKey(tx.blockTime, tx.blockHeight),
            Buffer.alloc(0),
        );

        return pendingOutputs;
    }

    /**
     * Mark outputs as spent. Reads from committed DB state, with an optional
     * pendingOutputs map for outputs that were just saved in the current batch
     * (handles same-block spends where the output isn't committed yet).
     */
    async markOutputsSpent(
        batch: BatchWriter,
        outpoints: [string, number][],
        pendingOutputs?: Map<string, { pubKey: string; value: number }>,
    ): Promise<void> {
        for (const [txid, vout] of outpoints) {
            const key = encodeOutputKey(txid, vout);
            const pendingKey = `${txid}:${vout}`;

            // Check pending outputs first (same-block spend)
            const pending = pendingOutputs?.get(pendingKey);
            if (pending) {
                batch.put(
                    key,
                    encodeOutputValue(pending.pubKey, pending.value, true),
                );
                batch.del(encodeUnspentIndexKey(txid, vout));
                continue;
            }

            // Fall back to committed DB state
            const existing = this.get(key);
            if (!existing) continue; // output not in our index (not P2TR)

            const decoded = decodeOutputValue(existing);
            if (decoded.isSpent) continue; // already spent

            // Flip isSpent byte and write back
            batch.put(
                key,
                encodeOutputValue(decoded.pubKey, decoded.value, true),
            );
            // Remove from unspent index
            batch.del(encodeUnspentIndexKey(txid, vout));
        }
    }

    saveBlockState(batch: BatchWriter, state: BlockStateData): void {
        batch.put(
            encodeBlockStateKey(state.blockHeight),
            Buffer.from(state.blockHash, 'hex'),
        );
    }

    saveOperationState(
        batch: BatchWriter,
        id: string,
        state: OperationStateData['state'],
    ): void {
        batch.put(
            encodeOpStateKey(id),
            Buffer.from(JSON.stringify(state), 'utf8'),
        );
    }

    async deleteTransactionsByBlockHash(
        batch: BatchWriter,
        blockHash: string,
    ): Promise<void> {
        // Find all txids for this block hash
        const range = hashIndexRange(blockHash);
        const txids = this.collectRange(
            range,
            (key) => decodeHashIndexKey(key).txid,
        );

        for (const txid of txids) {
            // Get transaction to find blockHeight and blockTime for index cleanup
            const txBuf = this.get(encodeTxKey(txid));
            if (!txBuf) continue;
            const tx = decodeTxValue(txBuf);

            // Delete primary transaction
            batch.del(encodeTxKey(txid));

            // Delete all outputs and unspent index entries
            const outRange = outputPrefixRange(txid);
            const outputKeys = this.collectRange(outRange, (key) => key);
            for (const key of outputKeys) {
                batch.del(key);
            }
            const unspentRange = unspentPrefixRange(txid);
            const unspentKeys = this.collectRange(unspentRange, (key) => key);
            for (const key of unspentKeys) {
                batch.del(key);
            }

            // Delete secondary indexes
            batch.del(encodeHeightIndexKey(tx.blockHeight, txid));
            batch.del(encodeHashIndexKey(blockHash, txid));
            batch.del(encodeTimeIndexKey(tx.blockTime, tx.blockHeight));
        }
    }

    deleteBlockState(batch: BatchWriter, height: number): void {
        batch.del(encodeBlockStateKey(height));
    }

    // --- Private helpers ---

    private getOutputsForTxid(
        txid: string,
        filterSpent: boolean,
    ): OutputData[] {
        if (filterSpent) {
            // Use unspent index to only fetch unspent outputs
            const unspentRange = unspentPrefixRange(txid);
            const unspentVouts = this.collectRange(
                unspentRange,
                (key) => decodeUnspentIndexKey(key).vout,
            );

            const outputs: OutputData[] = [];
            for (const vout of unspentVouts) {
                const buf = this.get(encodeOutputKey(txid, vout));
                if (!buf) continue;
                const decoded = decodeOutputValue(buf);
                outputs.push({
                    transactionId: txid,
                    vout,
                    ...decoded,
                });
            }
            return outputs;
        }

        // Fetch all outputs
        const range = outputPrefixRange(txid);
        return this.collectRange(range, (key, value) => {
            const { vout } = decodeOutputKey(key);
            const decoded = decodeOutputValue(value);
            return {
                transactionId: txid,
                vout,
                ...decoded,
            };
        });
    }

    private async fetchTransactions(
        txids: string[],
        filterSpent: boolean,
    ): Promise<TransactionData[]> {
        const transactions: TransactionData[] = [];
        for (const txid of txids) {
            const tx = await this.getTransactionByTxid(txid, filterSpent);
            if (tx) transactions.push(tx);
        }
        return transactions;
    }
}
