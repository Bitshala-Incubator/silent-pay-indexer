import { OperationStateService } from '@/operation-state/operation-state.service';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    IndexerService,
    TransactionInput,
    TransactionOutput,
} from '@/indexer/indexer.service';
import { ConfigService } from '@nestjs/config';
import { BlockStateService } from '@/block-state/block-state.service';
import { BatchWriter } from '@/storage/batch-writer';
import { StorageService } from '@/storage/storage.service';

export abstract class BaseBlockDataProvider<OperationState> {
    protected readonly eventEmitter: EventEmitter2 = new EventEmitter2();
    protected abstract readonly logger: Logger;
    protected abstract readonly operationStateKey: string;

    protected constructor(
        protected readonly configService: ConfigService,
        private readonly indexerService: IndexerService,
        private readonly operationStateService: OperationStateService,
        protected readonly blockStateService: BlockStateService,
        protected readonly storageService: StorageService,
    ) {}

    async indexTransaction(
        txid: string,
        vin: TransactionInput[],
        vout: TransactionOutput[],
        blockHeight: number,
        blockHash: string,
        blockTime: number,
        batch: BatchWriter,
    ): Promise<Map<string, { pubKey: string; value: number }>> {
        return this.indexerService.index(
            txid,
            vin,
            vout,
            blockHeight,
            blockHash,
            blockTime,
            batch,
        );
    }

    async getState(): Promise<OperationState> {
        return (
            await this.operationStateService.getOperationState(
                this.operationStateKey,
            )
        )?.state;
    }

    async setState(
        state: OperationState,
        blockState: { blockHeight: number; blockHash: string },
        batch: BatchWriter,
    ): Promise<void> {
        this.storageService.saveOperationState(
            batch,
            this.operationStateKey,
            state,
        );
        this.storageService.saveBlockState(batch, blockState);
    }

    abstract getBlockHash(height: number): Promise<string>;

    async traceReorg(): Promise<number> {
        let state = await this.blockStateService.getCurrentBlockState();

        if (!state) return null;

        while (state) {
            const fetchedBlockHash = await this.getBlockHash(state.blockHeight);

            if (state.blockHash === fetchedBlockHash) return state.blockHeight;

            await this.blockStateService.removeState(state);

            this.logger.log(
                `Reorg found at height: ${state.blockHeight}, Wrong hash: ${state.blockHash}, Correct hash: ${fetchedBlockHash}`,
            );
            state = await this.blockStateService.getCurrentBlockState();
        }

        throw new Error('Cannot Reorgs, blockchain state exhausted');
    }
}
