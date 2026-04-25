import { RootDatabase } from 'lmdb';

type Op =
    | { type: 'put'; key: Buffer; value: Buffer }
    | { type: 'del'; key: Buffer };

/**
 * Queues put/del operations and applies them atomically via LMDB's
 * transactionSync on commit(). If commit() is never called, the
 * batch is discarded (implicit rollback).
 */
export class BatchWriter {
    private readonly db: RootDatabase<Buffer, Buffer>;
    private readonly ops: Op[] = [];

    constructor(db: RootDatabase<Buffer, Buffer>) {
        this.db = db;
    }

    put(key: Buffer, value: Buffer): this {
        this.ops.push({ type: 'put', key, value });
        return this;
    }

    del(key: Buffer): this {
        this.ops.push({ type: 'del', key });
        return this;
    }

    async commit(): Promise<void> {
        this.db.transactionSync(() => {
            for (const op of this.ops) {
                if (op.type === 'put') {
                    this.db.putSync(op.key, op.value);
                } else {
                    this.db.removeSync(op.key);
                }
            }
        });
    }
}
