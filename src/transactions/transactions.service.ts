import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { TransactionData } from '@/storage/interfaces';

@Injectable()
export class TransactionsService {
    constructor(private readonly storageService: StorageService) {}

    async getTransactionByBlockHeight(
        blockHeight: number,
        filterSpent: boolean,
    ): Promise<TransactionData[]> {
        return this.storageService.getTransactionsByBlockHeight(
            blockHeight,
            filterSpent,
        );
    }

    async getTransactionsByBlockHeightRange(
        startHeight: number,
        endHeight: number,
        filterSpent: boolean,
    ): Promise<TransactionData[]> {
        return this.storageService.getTransactionsByBlockHeightRange(
            startHeight,
            endHeight,
            filterSpent,
        );
    }

    async getTransactionByBlockHash(
        blockHash: string,
        filterSpent: boolean,
    ): Promise<TransactionData[]> {
        return this.storageService.getTransactionsByBlockHash(
            blockHash,
            filterSpent,
        );
    }

    async getTransactionByTxid(
        txid: string,
        filterSpent: boolean,
    ): Promise<TransactionData | null> {
        return this.storageService.getTransactionByTxid(txid, filterSpent);
    }

    async deleteTransactionByBlockHash(blockHash: string): Promise<void> {
        const batch = this.storageService.createBatch();
        await this.storageService.deleteTransactionsByBlockHash(
            batch,
            blockHash,
        );
        await batch.commit();
    }

    async getBlockHeightByTimestamp(
        timestamp: number,
    ): Promise<{ blockHeight: number }> {
        const blockHeight = await this.storageService.getBlockHeightByTimestamp(
            timestamp,
        );

        if (blockHeight === null) {
            throw new NotFoundException(
                'No block found after the given timestamp',
            );
        }

        return { blockHeight };
    }
}
