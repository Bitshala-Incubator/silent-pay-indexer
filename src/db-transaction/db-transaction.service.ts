import { Injectable } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { BatchWriter } from '@/storage/batch-writer';

@Injectable()
export class DbTransactionService {
    constructor(private readonly storageService: StorageService) {}

    async execute<T>(
        executable: (batch: BatchWriter) => Promise<T>,
    ): Promise<T> {
        const batch = this.storageService.createBatch();
        try {
            const result = await executable(batch);
            await batch.commit();
            return result;
        } catch (err) {
            // Batch is discarded (not committed) — equivalent to rollback
            throw err;
        }
    }
}
