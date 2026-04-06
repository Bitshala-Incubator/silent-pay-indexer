import { Injectable } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { BlockStateData } from '@/storage/interfaces';

@Injectable()
export class BlockStateService {
    constructor(private readonly storageService: StorageService) {}

    async getCurrentBlockState(): Promise<BlockStateData> {
        return this.storageService.getCurrentBlockState();
    }

    async removeState(state: BlockStateData): Promise<void> {
        const batch = this.storageService.createBatch();
        this.storageService.deleteBlockState(batch, state.blockHeight);
        await this.storageService.deleteTransactionsByBlockHash(
            batch,
            state.blockHash,
        );
        await batch.commit();
    }
}
