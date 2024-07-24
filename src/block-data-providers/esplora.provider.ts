import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { OperationStateService } from '@/operation-state/operation-state.service';
import { BaseBlockDataProvider } from '@/block-data-providers/base-block-data-provider.abstract';
import { TAPROOT_ACTIVATION_HEIGHT } from '@/common/constants';
import { ConfigService } from '@nestjs/config';
import { BitcoinNetwork } from '@/common/enum';
import { URL } from 'url';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IndexerService, TransactionInput } from '@/indexer/indexer.service';
import { AxiosRetryConfig, makeRequest } from '@/common/request';

type EsploraOperationState = {
    currentBlockHeight: number;
    indexedBlockHeight: number;
};

type EsploraTransactionInput = {
    txid: string;
    vout: number;
    prevout: {
        scriptpubkey: string;
        scriptpubkey_asm: string;
        scriptpubkey_type: string;
        scriptpubkey_address: string;
        value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    witness: string[];
    is_coinbase: boolean;
    sequence: number;
};

type EsploraTransactionOutput = {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
};

type EsploraTransaction = {
    txid: string;
    version: number;
    locktime: number;
    vin: EsploraTransactionInput[];
    vout: EsploraTransactionOutput[];
    size: number;
    weight: number;
    fee: number;
    status: {
        confirmed: boolean;
        block_height: number;
        block_hash: string;
        block_time: number;
    };
};

@Injectable()
export class EsploraProvider
    extends BaseBlockDataProvider
    implements OnApplicationBootstrap
{
    protected readonly logger = new Logger(EsploraProvider.name);
    protected readonly operationStateKey = 'esplora-operation-state';
    private readonly baseUrl: string;
    private retryConfig: AxiosRetryConfig;
    private isSyncing = false;
    private readonly batchSize: number;

    constructor(
        private readonly configService: ConfigService,
        indexerService: IndexerService,
        operationStateService: OperationStateService,
    ) {
        super(indexerService, operationStateService);

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
        const getState = await this.getState();
        if (getState) {
            this.logger.log(
                `Restoring state from previous run: ${JSON.stringify(
                    getState,
                )}`,
            );
        } else {
            this.logger.log('No previous state found. Starting from scratch.');
            const state: EsploraOperationState = {
                currentBlockHeight: 0,
                indexedBlockHeight:
                    this.configService.get<BitcoinNetwork>('app.network') ===
                    BitcoinNetwork.MAINNET
                        ? TAPROOT_ACTIVATION_HEIGHT - 1
                        : 0,
            };
            await this.setState(state);
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

            for (
                let height = state.indexedBlockHeight + 1;
                height <= tipHeight;
                height++
            ) {
                const blockHash = await this.getBlockHash(height);
                this.logger.log(
                    `Processing block at height ${height}, hash ${blockHash}`,
                );

                await this.processBlock(height, blockHash);

                state.indexedBlockHeight = height;
                await this.setState(state);
            }
        } finally {
            this.isSyncing = false;
        }
    }

    private async processBlock(height: number, hash: string) {
        const txids = await this.getTxidsForBlock(hash);

        for (let i = 1; i < txids.length; i += this.batchSize) {
            const batch = txids.slice(
                i,
                Math.min(i + this.batchSize, txids.length),
            );

            await Promise.all(
                batch.map(async (txid) => {
                    const tx = await this.getTx(txid);
                    const vin: TransactionInput[] = tx.vin.map((input) => ({
                        txid: input.txid,
                        vout: input.vout,
                        scriptSig: input.scriptsig,
                        prevOutScript: input.prevout.scriptpubkey,
                        witness: input.witness,
                    }));
                    const vout = tx.vout.map((output) => ({
                        scriptPubKey: output.scriptpubkey,
                        value: output.value,
                    }));

                    await this.indexTransaction(txid, vin, vout, height, hash);
                }, this),
            );
        }
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

    private async getBlockHash(height: number): Promise<string> {
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
