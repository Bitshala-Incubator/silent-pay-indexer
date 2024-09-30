import { OperationStateService } from '@/operation-state/operation-state.service';
import { Logger, OnModuleInit } from '@nestjs/common';
import {
    IndexerService,
    TransactionInput,
    TransactionOutput,
} from '@/indexer/indexer.service';
import { TransactionsService } from '@/transactions/transactions.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';

export interface BaseOperationState {
    indexedBlockHeight: number;
    blockCache: Record<number, string>;
}

export abstract class BaseBlockDataProvider<
    OperationState extends BaseOperationState,
> implements OnModuleInit
{
    protected abstract readonly logger: Logger;
    protected abstract readonly operationStateKey: string;
    protected readonly cacheSize = 6;
    protected readonly cronJobName = 'providerSync';

    protected constructor(
        protected readonly configService: ConfigService,
        private readonly indexerService: IndexerService,
        private readonly operationStateService: OperationStateService,
        private readonly transactionService: TransactionsService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    onModuleInit() {
        this.initiateCronJob();
    }

    abstract sync(): void;

    private initiateCronJob() {
        const schedulerInterval = this.configService.get<string>(
            'app.schedulerInterval',
        );

        const job = new CronJob(schedulerInterval, () => this.sync());

        this.schedulerRegistry.addCronJob(this.cronJobName, job);
        job.start();
    }

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
        currentState: OperationState,
        partialState: Partial<OperationState>,
    ): Promise<void> {
        if (partialState.blockCache) {
            const updatedBlockCache = {
                ...currentState.blockCache,
                ...partialState.blockCache,
            };

            if (this.cacheSize < Object.keys(updatedBlockCache).length) {
                delete updatedBlockCache[currentState.indexedBlockHeight - 5];
            }

            partialState.blockCache = updatedBlockCache;
        }

        const newState = {
            ...currentState,
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

        if (Object.keys(blockCache).length === 0) {
            return indexedBlockHeight;
        }

        while (true) {
            const storedBlockHash = blockCache[counter];

            if (storedBlockHash === undefined) {
                throw new Error('Reorgs levels deep');
            }

            const fetchedBlockHash = await this.getBlockHash(counter);

            if (storedBlockHash === fetchedBlockHash) {
                return counter;
            }

            await this.transactionService.deleteTransactionByBlockHash(
                storedBlockHash,
            );

            --counter;
        }
    }
}
