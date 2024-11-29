import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BaseBlockDataProvider } from '@/block-data-providers/base-block-data-provider.abstract';
import { AxiosRetryConfig, makeRequest } from '@/common/request';
import { ConfigService } from '@nestjs/config';
import { IndexerService, TransactionInput } from '@/indexer/indexer.service';
import { OperationStateService } from '@/operation-state/operation-state.service';
import { BitcoinNetwork } from '@/common/enum';
import { URL } from 'url';
import {
    EsploraOperationState,
    EsploraTransaction,
} from '@/block-data-providers/esplora/interface';
import { TAPROOT_ACTIVATION_HEIGHT } from '@/common/constants';
import { BlockStateService } from '@/block-state/block-state.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DbTransactionService } from '@/db-transaction/db-transaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { INDEXED_BLOCK_EVENT } from '@/common/events';

@Injectable()
export class EsploraProvider
    extends BaseBlockDataProvider<EsploraOperationState>
    implements OnApplicationBootstrap
{
    protected readonly logger = new Logger(EsploraProvider.name);
    protected readonly operationStateKey = 'esplora-operation-state';
    private readonly baseUrl: string;
    private retryConfig: AxiosRetryConfig;
    private isSyncing = false;
    private readonly batchSize: number;

    constructor(
        configService: ConfigService,
        indexerService: IndexerService,
        operationStateService: OperationStateService,
        blockStateService: BlockStateService,
        private readonly dbTransactionService: DbTransactionService,
        protected readonly eventEmitter: EventEmitter2,
    ) {
        super(
            configService,
            indexerService,
            operationStateService,
            blockStateService,
        );

        this.batchSize = this.configService.get<number>('esplora.batchSize');

        let pathPrefix;
        switch (this.configService.get<BitcoinNetwork>('app.network')) {
            case BitcoinNetwork.TESTNET:
                pathPrefix = '/testnet/api';
                break;
            case BitcoinNetwork.REGTEST:
                pathPrefix = '/regtest/api';
                break;
            case BitcoinNetwork.MAINNET:
            default:
                pathPrefix = '/api';
        }
        this.baseUrl = new URL(
            `${this.configService.get<string>('esplora.url')}${pathPrefix}`,
        ).toString();

        this.retryConfig =
            this.configService.get<AxiosRetryConfig>('app.requestRetry');
    }

    async onApplicationBootstrap() {
        const currentState = await this.getState();
        if (currentState) {
            this.logger.log(
                `Restoring state from previous run: ${JSON.stringify(
                    currentState,
                )}`,
            );
        } else {
            this.logger.log('No previous state found. Starting from scratch.');

            const blockHeight =
                this.configService.get<BitcoinNetwork>('app.network') ===
                BitcoinNetwork.MAINNET
                    ? TAPROOT_ACTIVATION_HEIGHT - 1
                    : 0;
            const blockHash = await this.getBlockHash(blockHeight);

            await this.dbTransactionService.execute(async (manager) => {
                await this.setState(
                    {
                        currentBlockHeight: 0,
                        indexedBlockHeight: blockHeight,
                        lastProcessedTxIndex: 0, // we don't take coinbase txn into account
                    },
                    {
                        blockHash,
                        blockHeight,
                    },
                    manager,
                );
            });
        }
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async sync() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        const state = await this.getState();
        if (!state) {
            throw new Error('State not found');
        }

        try {
            const tipHeight = await this.getTipHeight();
            if (tipHeight <= state.indexedBlockHeight) {
                this.logger.log(
                    `No new blocks found. Current tip height: ${tipHeight}`,
                );
                this.isSyncing = false;
                return;
            }

            let height =
                ((await this.traceReorg()) ?? state.indexedBlockHeight) + 1;

            for (height; height <= tipHeight; height++) {
                const blockHash = await this.getBlockHash(height);
                this.logger.log(
                    `Processing block at height ${height}, hash ${blockHash}`,
                );

                await this.processBlock(height, blockHash);
            }
        } finally {
            this.isSyncing = false;
        }
    }

    private async processBlock(height: number, hash: string) {
        const state = await this.getState();
        const txids = await this.getTxidsForBlock(hash);

        for (
            let i = state.lastProcessedTxIndex + 1;
            i < txids.length;
            i += this.batchSize
        ) {
            const batch = txids.slice(
                i,
                Math.min(i + this.batchSize, txids.length),
            );

            try {
                await this.dbTransactionService.execute(async (manager) => {
                    await Promise.all(
                        batch.map(async (txid) => {
                            const tx = await this.getTx(txid);
                            const vin: TransactionInput[] = tx.vin.map(
                                (input) => ({
                                    txid: input.txid,
                                    vout: input.vout,
                                    scriptSig: input.scriptsig,
                                    prevOutScript: input.prevout.scriptpubkey,
                                    witness: input.witness,
                                }),
                            );
                            const vout = tx.vout.map((output) => ({
                                scriptPubKey: output.scriptpubkey,
                                value: output.value,
                            }));

                            await this.indexTransaction(
                                txid,
                                vin,
                                vout,
                                height,
                                hash,
                                manager,
                            );
                        }, this),
                    );

                    state.indexedBlockHeight = height;
                    state.lastProcessedTxIndex = i + this.batchSize - 1;
                    await this.setState(
                        state,
                        {
                            blockHeight: height,
                            blockHash: hash,
                        },
                        manager,
                    );
                });

                this.eventEmitter.emit(INDEXED_BLOCK_EVENT, height);
            } catch (error) {
                this.logger.error(
                    `Error processing transactions in block at height ${height}, hash ${hash}: ${error.message}`,
                );
                throw error;
            }
        }
        this.isSyncing = false;
    }

    private async getTipHeight(): Promise<number> {
        return makeRequest(
            {
                method: 'GET',
                url: `${this.baseUrl}/blocks/tip/height`,
            },
            this.retryConfig,
            this.logger,
        );
    }

    private async getTipHash(): Promise<string> {
        return makeRequest(
            {
                method: 'GET',
                url: `${this.baseUrl}/blocks/tip/hash`,
            },
            this.retryConfig,
            this.logger,
        );
    }

    async getBlockHash(height: number): Promise<string> {
        return makeRequest(
            {
                method: 'GET',
                url: `${this.baseUrl}/block-height/${height}`,
            },
            this.retryConfig,
            this.logger,
        );
    }

    private async getTxidsForBlock(hash: string): Promise<string[]> {
        return makeRequest(
            {
                method: 'GET',
                url: `${this.baseUrl}/block/${hash}/txids`,
            },
            this.retryConfig,
            this.logger,
        );
    }

    private async getTx(txid: string): Promise<EsploraTransaction> {
        return makeRequest(
            {
                method: 'GET',
                url: `${this.baseUrl}/tx/${txid}`,
            },
            this.retryConfig,
            this.logger,
        );
    }
}
