import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import axios, { AxiosRequestConfig } from 'axios';

type PartialUtxo = {
    value: number;
    scriptPubKey: {
        address: string;
    };
};

export class BitcoinRPCUtil {
    private readonly url: string;
    private readonly axiosConfig: AxiosRequestConfig;

    constructor(configPath = './config/e2e.config.yaml') {
        const config = yaml.load(readFileSync(configPath, 'utf8')) as Record<
            string,
            any
        >;
        const user = config.bitcoinCore.rpcUser;
        const password = config.bitcoinCore.rpcPass;
        const host = config.bitcoinCore.rpcHost;
        const port = config.bitcoinCore.rpcPort;
        const protocol = config.bitcoinCore.protocol;
        this.url = `${protocol}://${host}:${port}/`;
        this.axiosConfig = {
            method: 'POST',
            auth: {
                username: user,
                password: password,
            },
        };
    }

    public async request(config: AxiosRequestConfig): Promise<any> {
        try {
            const response = await axios.request({
                ...this.axiosConfig,
                ...config,
                url: this.url,
            });
            return response.data?.result;
        } catch (error) {
            throw new Error(
                `Request failed with status code ${error.response.status}`,
            );
        }
    }

    async getBlockHeight(): Promise<number> {
        return await this.request({
            data: {
                jsonrpc: '1.0',
                id: 'silent_payment_indexer',
                method: 'getblockcount',
                params: [],
            },
        });
    }

    async createWallet(walletName: string): Promise<any> {
        return await this.request({
            data: {
                method: 'createwallet',
                params: [walletName],
                jsonrpc: '1.0',
                id: 'silent_payment_indexer',
            },
        });
    }

    async loadWallet(walletName: string): Promise<any> {
        return await this.request({
            data: {
                method: 'loadwallet',
                params: [walletName],
                jsonrpc: '1.0',
                id: 'silent_payment_indexer',
            },
        });
    }

    async getNewAddress(): Promise<string> {
        return await this.request({
            data: {
                method: 'getnewaddress',
                params: [],
                jsonrpc: '1.0',
                id: 'silent_payment_indexer',
            },
        });
    }

    async mineToAddress(numBlocks: number, address: string): Promise<any> {
        return await this.request({
            data: {
                method: 'generatetoaddress',
                params: [numBlocks, address],
            },
        });
    }

    async sendToAddress(address: string, amount: number): Promise<string> {
        return await this.request({
            data: {
                method: 'sendtoaddress',
                params: [address, amount],
            },
        });
    }

    async sendRawTransaction(rawTx: string): Promise<any> {
        return await this.request({
            data: {
                method: 'sendrawtransaction',
                params: [rawTx],
            },
        });
    }

    async getTxOut(txid: string, vout: number): Promise<PartialUtxo> {
        return await this.request({
            data: {
                method: 'gettxout',
                params: [txid, vout],
            },
        });
    }

    async getRawTransaction(txid: string): Promise<any> {
        return await this.request({
            data: {
                method: 'getrawtransaction',
                params: [txid],
            },
        });
    }
}
