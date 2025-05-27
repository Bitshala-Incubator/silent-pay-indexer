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
import { BlockState } from '@/block-state/block-state.entity';
import { EntityManager } from 'typeorm';
import { OperationState } from '@/operation-state/operation-state.entity';
import { Transaction } from '@/transactions/transaction.entity';

export abstract class BaseBlockDataProvider<OperationState> {
    protected readonly eventEmitter: EventEmitter2 = new EventEmitter2();
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
        manager: EntityManager,
    ): Promise<void> {
        await this.indexerService.index(
            txid,
            vin,
            vout,
            blockHeight,
            blockHash,
            manager,
        );
    }

    async indexAllTransactions(
        transactions: Transaction[],
        manager: EntityManager,
    ): Promise<void> {
        await this.indexerService.indexAll(transactions, manager);
    }

    protected getDomainTransaction(
        txid: string,
        vin: TransactionInput[],
        vout: TransactionOutput[],
        blockHeight: number,
        blockHash: string,
    ): Transaction | null {
        const scanResult = this.indexerService.deriveOutputsAndComputeScanTweak(
            vin,
            vout,
        );
        if (!scanResult) return null;

        const { scanTweak, eligibleOutputs: outputs } = scanResult;

        const transaction = new Transaction();
        transaction.id = txid;
        transaction.blockHeight = blockHeight;
        transaction.blockHash = blockHash;
        transaction.scanTweak = scanTweak.toString('hex');
        transaction.outputs = outputs;

        return transaction;
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
        manager: EntityManager,
    ): Promise<void> {
        const operationState = new OperationState();
        operationState.id = this.operationStateKey;
        operationState.state = state;

        await manager.save(OperationState, operationState);
        await manager.save(BlockState, blockState);
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
