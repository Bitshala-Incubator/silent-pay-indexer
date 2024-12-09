import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import axios, { AxiosRequestConfig } from 'axios';
import { setTimeout } from 'timers/promises';

type PartialUtxo = {
    value: number;
    scriptPubKey: {
        address: string;
    };
};

export class BitcoinRPCUtil {
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
        this.axiosConfig = {
            method: 'POST',
            auth: {
                username: user,
                password: password,
            },
            url: `${protocol}://${host}:${port}/`,
        };
    }

    public async waitForBitcoind(): Promise<void> {
        for (let i = 0; i < 10; i++) {
            try {
                await this.getBlockchainInfo();
                return;
            } catch (error) {
                await setTimeout(2000);
            }
        }
        throw new Error('Bitcoind refused to start');
    }

    public async request(config: AxiosRequestConfig): Promise<any> {
        try {
            const response = await axios.request({
                ...this.axiosConfig,
                ...config,
            });
            return response.data?.result;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    body: error.response?.data,
                    status: error.response?.status,
                };
            } else {
                throw error;
            }
        }
    }

    createWallet(walletName: string): Promise<any> {
        return this.request({
            data: {
                method: 'createwallet',
                params: [walletName],
            },
        });
    }

    loadWallet(walletName: string): Promise<any> {
        return this.request({
            data: {
                method: 'createwallet',
                params: [walletName],
            },
        });
    }

    getNewAddress(): Promise<string> {
        return this.request({
            data: {
                method: 'getnewaddress',
                params: [],
            },
        });
    }

    getBlockCount(): Promise<number> {
        return this.request({
            data: {
                method: 'getblockcount',
                params: [],
            },
        });
    }

    getBlockchainInfo(): Promise<object> {
        return this.request({
            data: {
                method: 'getblockchaininfo',
                params: [],
            },
        });
    }

    mineToAddress(numBlocks: number, address: string): Promise<any> {
        return this.request({
            data: {
                method: 'generatetoaddress',
                params: [numBlocks, address],
            },
        });
    }

    sendToAddress(address: string, amount: number): Promise<string> {
        return this.request({
            data: {
                method: 'sendtoaddress',
                params: [address, amount],
            },
        });
    }

    sendRawTransaction(rawTx: string): Promise<any> {
        return this.request({
            data: {
                method: 'sendrawtransaction',
                params: [rawTx],
            },
        });
    }

    getTxOut(txid: string, vout: number): Promise<PartialUtxo> {
        return this.request({
            data: {
                method: 'gettxout',
                params: [txid, vout],
            },
        });
    }

    getRawTransaction(txid: string): Promise<any> {
        return this.request({
            data: {
                method: 'getrawtransaction',
                params: [txid],
            },
        });
    }
}
