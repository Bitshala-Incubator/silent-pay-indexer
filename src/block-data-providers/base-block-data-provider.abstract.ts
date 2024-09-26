import { OperationStateService } from '@/operation-state/operation-state.service';
import { Logger } from '@nestjs/common';
import {
    IndexerService,
    TransactionInput,
    TransactionOutput,
} from '@/indexer/indexer.service';

export interface BaseOperationState {
    indexedBlockHeight: number;
    blockCache: Record<number, string>;
}

export abstract class BaseBlockDataProvider<
    OperationState extends BaseOperationState,
> {
    protected abstract readonly logger: Logger;
    protected abstract readonly operationStateKey: string;
    protected cacheSize = 6;

    protected constructor(
        private readonly indexerService: IndexerService,
        private readonly operationStateService: OperationStateService,
    ) {}

    async indexTransaction(
        txid: string,
        vin: TransactionInput[],
        vout: TransactionOutput[],
        blockHeight: number,
        blockHash: string,
    ): Promise<void> {
        await this.indexerService.index(
            txid,
            vin,
            vout,
            blockHeight,
            blockHash,
        );
    }

    async getState(): Promise<OperationState> {
        return (
            await this.operationStateService.getOperationState(
                this.operationStateKey,
            )
        )?.state;
    }

    async setState(partialState: Partial<OperationState>): Promise<void> {
        const oldState = await this.getState();

        if (partialState.blockCache) {
            const updatedBlockCache = {
                ...oldState.blockCache,
                ...partialState.blockCache,
            };

            if (this.cacheSize < Object.keys(updatedBlockCache).length) {
                delete updatedBlockCache[oldState.indexedBlockHeight];
            }

            partialState.blockCache = updatedBlockCache;
        }

        const newState = {
            ...oldState,
            ...partialState,
        };

        await this.operationStateService.setOperationState(
            this.operationStateKey,
            newState,
        );
    }

    abstract getBlockHash(height: number): Promise<string>;

    async traceReorg(): Promise<number> {
        const { indexedBlockHeight, blockCache } = await this.getState();
        let counter = indexedBlockHeight;

        while (true) {
            const storedBlockHash = blockCache[counter];

            if (storedBlockHash === undefined) {
                throw new Error('Reorgs levels deep');
            }

            const fetchedBlockHash = await this.getBlockHash(counter);

            if (storedBlockHash === fetchedBlockHash) {
                return counter;
            }

            --counter;
        }
    }

}
