import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import axios, { AxiosRequestConfig } from 'axios';

export class BitcoinRPCUtil {
    private readonly url: string;
    private readonly config: AxiosRequestConfig;

    constructor(configPath = './config/e2e.config.yaml') {
        const config = yaml.load(readFileSync(configPath, 'utf8')) as Record<string, any>;
        const user = config.bitcoinCore.rpcUser;
        const password = config.bitcoinCore.rpcPass;
        const host = config.bitcoinCore.rpcHost;
        const port = config.bitcoinCore.rpcPort;
        const protocol = config.bitcoinCore.protocol;
        this.url = `${protocol}://${user}:${password}@${host}:${port}/`;
        this.config = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        };
    }

    public async request(config: AxiosRequestConfig): Promise<any> {
        const response = await axios.request({
            ...this.config,
            ...config,
            url: this.url,
        });
        return response.data?.result;
    }

    async getBlockHeight(): Promise<number> {
        return await this.request({
            data: {
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
            },
        });
    }

    async loadWallet(walletName: string): Promise<any> {
        return await this.request({
            data: {
                method: 'loadwallet',
                params: [walletName],
            },
        });
    }

    async getNewAddress(): Promise<any> {
        return await this.request({
            data: {
                method: 'getnewaddress',
                params: [],
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

    async sendToAddress(address: string, amount: number): Promise<any> {
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
}