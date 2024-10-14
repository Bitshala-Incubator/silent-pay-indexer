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
    indexedBlockHash: string;
}

export abstract class BaseBlockDataProvider<
    OperationState extends BaseOperationState,
> implements OnModuleInit
{
    protected abstract readonly logger: Logger;
    protected readonly cronJobName = 'providerSync';
    protected readonly schedulerInterval = '*/10 * * * * *';
    protected emptyHash =
        '0000000000000000000000000000000000000000000000000000000000000000';

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
        const job = new CronJob(this.schedulerInterval, () => this.sync());

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
        const state =
            await this.operationStateService.getCurrentOperationState();
        return state as unknown as Promise<OperationState>;
    }

    async setState(futureState: Partial<OperationState>): Promise<void> {
        await this.operationStateService.setOperationState(futureState);
    }

    abstract getBlockHash(height: number): Promise<string>;

    async traceReorg(): Promise<number> {
        let state = await this.operationStateService.getCurrentOperationState();

        if (state.indexedBlockHash === this.emptyHash) {
            return state.indexedBlockHeight;
        }

        while (true) {
            if (state === null) {
                throw new Error('Reorgs levels deep');
            }

            const fetchedBlockHash = await this.getBlockHash(
                state.indexedBlockHeight,
            );

            if (state.indexedBlockHash === fetchedBlockHash) {
                return state.indexedBlockHeight;
            }

            await this.transactionService.deleteTransactionByBlockHash(
                state.indexedBlockHash,
            );

            state = await this.operationStateService.dequeue_operation_state();
        }
    }
}
