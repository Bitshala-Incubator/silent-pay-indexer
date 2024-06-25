import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { OperationStateService } from '@/operation-state/operation-state.service';
import { BaseBlockDataProvider } from '@/block-data-providers/base-block-data-provider.abstract';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { TAPROOT_ACTIVATION_HEIGHT } from '@/common/constants';
import { ConfigService } from '@nestjs/config';
import { BitcoinNetwork } from '@/common/enum';
import { URL } from 'url';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IndexerService, TransactionInput } from '@/indexer/indexer.service';

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
    private isSyncing = false;

    constructor(
        private readonly configService: ConfigService,
        indexerService: IndexerService,
        operationStateService: OperationStateService,
    ) {
        super(indexerService, operationStateService);

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

            try {
                await this.processBlock(height, blockHash);
            } catch (error) {
                this.logger.error(
                    `Error processing block at height ${height}, hash ${blockHash}: ${error.message}`,
                );
                this.isSyncing = false;
                break;
            }

            state.indexedBlockHeight = height;
            await this.setState(state);
        }

        this.isSyncing = false;
    }

    private async processBlock(height: number, hash: string) {
        const txids = await this.getTxidsForBlock(hash);

        // this is not very efficient
        // at the time of implementation, I'm using a public esplora instance,
        // so there is a rate limit on the number of requests
        // in the future, we should add a flag to parallelize this
        for (let i = 1; i < txids.length; i++) {
            const txid = txids[i];
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
        }
    }

    async request(config: AxiosRequestConfig): Promise<any> {
        try {
            const response = await axios.request(config);
            this.logger.debug(
                `Request to Esplora succeeded:\nRequest:\n${JSON.stringify(
                    config,
                    null,
                    2,
                )}\nResponse:\n${JSON.stringify(response.data, null, 2)}`,
            );
            return response.data;
        } catch (error) {
            this.logger.error(error);
            if (error instanceof AxiosError) {
                if (error.response) {
                    this.logger.error(
                        `Request to Esplora failed!\nStatus code ${
                            error.response.status
                        }\nRequest:\n${JSON.stringify(
                            config,
                        )}\nResponse:\n${JSON.stringify(error.response.data)}`,
                    );
                }
            } else {
                this.logger.error(
                    `Request to Esplora failed!\nRequest:\n${JSON.stringify(
                        config,
                    )}\nError:\n${error.message}`,
                );
            }
        }
    }

    private async getTipHeight(): Promise<number> {
        return this.request({
            method: 'GET',
            url: `${this.baseUrl}/blocks/tip/height`,
        });
    }

    private async getTipHash(): Promise<string> {
        return this.request({
            method: 'GET',
            url: `${this.baseUrl}/blocks/tip/hash`,
        });
    }

    private async getBlockHash(height: number): Promise<string> {
        return this.request({
            method: 'GET',
            url: `${this.baseUrl}/block-height/${height}`,
        });
    }

    private async getTxidsForBlock(hash: string): Promise<string[]> {
        return this.request({
            method: 'GET',
            url: `${this.baseUrl}/block/${hash}/txids`,
        });
    }

    private async getTx(txid: string): Promise<EsploraTransaction> {
        return this.request({
            method: 'GET',
            url: `${this.baseUrl}/tx/${txid}`,
        });
    }
}
