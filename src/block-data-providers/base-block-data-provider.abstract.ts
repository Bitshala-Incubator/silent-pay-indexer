import { OperationStateService } from '@/operation-state/operation-state.service';
import { Logger } from '@nestjs/common';
import {
    IndexerService,
    TransactionInput,
    TransactionOutput,
} from '@/indexer/indexer.service';
import { ConfigService } from '@nestjs/config';
import { BlockStateService } from '@/block-state/block-state.service';
import { BlockState } from '@/block-state/block-state.entity';

export abstract class BaseBlockDataProvider<OperationState> {
    protected abstract readonly logger: Logger;
    protected abstract readonly operationStateKey: string;

    protected constructor(
        protected readonly configService: ConfigService,
        private readonly indexerService: IndexerService,
        private readonly operationStateService: OperationStateService,
        protected readonly blockStateService: BlockStateService,
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

    async setState(
        state: OperationState,
        blockState: BlockState,
    ): Promise<void> {
        await this.operationStateService.setOperationState(
            this.operationStateKey,
            state,
        );

        await this.blockStateService.addBlockState(blockState);
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
