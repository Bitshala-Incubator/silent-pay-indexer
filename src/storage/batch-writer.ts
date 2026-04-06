type LevelDB = any;

/**
 * Wraps a RocksDB/LevelUp chained batch for atomic writes.
 * All put/del operations are queued and applied atomically on commit().
 * If commit() is never called, the batch is discarded (implicit rollback).
 */
export class BatchWriter {
    private readonly batch: ReturnType<LevelDB['batch']>;

    constructor(db: LevelDB) {
        this.batch = db.batch();
    }

    put(key: Buffer, value: Buffer): this {
        this.batch.put(key, value);
        return this;
    }

    del(key: Buffer): this {
        this.batch.del(key);
        return this;
    }

    async commit(): Promise<void> {
        await this.batch.write();
    }
}
