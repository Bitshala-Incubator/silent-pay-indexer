import { OperationStateService } from '@/operation-state/operation-state.service';
import { Logger } from '@nestjs/common';
import {
    IndexerService,
    TransactionInput,
    TransactionOutput,
} from '@/indexer/indexer.service';

export abstract class BaseBlockDataProvider {
    protected abstract readonly logger: Logger;
    protected abstract readonly operationStateKey: string;

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

    async getState(): Promise<Record<string, any>> {
        return (
            await this.operationStateService.getOperationState(
                this.operationStateKey,
            )
        )?.state;
    }

    async setState(state: Record<string, any>): Promise<void> {
        await this.operationStateService.setOperationState(
            this.operationStateKey,
            state,
        );
    }
}
