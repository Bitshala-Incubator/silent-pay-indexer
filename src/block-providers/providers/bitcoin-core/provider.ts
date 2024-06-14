import { Provider } from '@/block-providers/providers/provider';
import { ProviderName } from '@/block-providers/providers/provider-utils';
import {
    IndexTransactionCommand,
    TransactionInput,
    TransactionOutput,
} from '@/commands/impl/index-transaction.command';
import { ConfigService } from '@nestjs/config';
import * as Client from 'bitcoin-core';
import { BitcoinCoreConfig } from '@/configuration.model';
import { Injectable } from '@nestjs/common';
import { Transaction } from 'bitcoinjs-lib';
import { Input, Output } from 'bitcoinjs-lib/src/transaction';

@Injectable()
export class BitcoinCoreProvider extends Provider {
    public readonly PROVIDER_NAME: ProviderName = 'bitcoincore';
    public START_BLOCK = 0;
    private config: BitcoinCoreConfig;
    public client: Client;

    public constructor(private configService: ConfigService) {
        super();

        const config = this.configService.get<BitcoinCoreConfig>('bitcoincore');
        this.client = new Client({
            network: config.network,
            host: config.rpchost,
            password: config.rpcpass,
            port: config.rpcport,
            username: config.rpcuser,
        });
    }

    public async init() {
        // TODO: create effeective way of maintaining state;
        this.START_BLOCK = (await this.getLatestBlock()) + 1;
    }

    public async load(): Promise<IndexTransactionCommand[]> {
        const blocks = await this.getTransactions();
        return blocks;
    }

    protected async getLatestBlock(): Promise<number> {
        return await this.client.getBlockCount();
    }

    private async getTransactions(): Promise<IndexTransactionCommand[]> {
        const latestBlock = await this.getLatestBlock();
        const paredTransactionList: IndexTransactionCommand[] = [];
        for (let i = this.START_BLOCK; i <= latestBlock; i++) {
            const blockHash: string = await this.client.getBlockHash(i);
            const txns: { tx: string[]; height: number; hash: string } =
                await this.client.getBlock(blockHash);
            for (const txhash of txns.tx) {
                const txn = await this.getTransaction(txhash);
                const parsedTransaction = await this.parseTransaction(
                    txn,
                    txns.hash,
                    txns.height,
                );
                paredTransactionList.push(parsedTransaction);
            }
        }
        return paredTransactionList;
    }

    private async getTransaction(txhash: string): Promise<Transaction> {
        const transaction: string = await this.client.getRawTransaction(txhash);
        return Transaction.fromHex(transaction);
    }

    private async parseTransaction(
        txn: Transaction,
        blockHash: string,
        blockHeight: number,
    ): Promise<IndexTransactionCommand> {
        const inputs: TransactionInput[] = await Promise.all(
            txn.ins.map(
                async (input) => await this.parseTransactionInput(input),
            ),
        );
        const outputs: TransactionOutput[] = txn.outs.map((output) =>
            this.parseTransactionOutput(output),
        );

        return new IndexTransactionCommand(
            txn.getId(),
            inputs,
            outputs,
            blockHeight,
            blockHash,
        );
    }

    private isCoinbase(txhash: string): boolean {
        return (
            txhash ===
            '0000000000000000000000000000000000000000000000000000000000000000'
        );
    }

    private async parseTransactionInput(
        txnInput: Input,
    ): Promise<TransactionInput> {
        const txhash = txnInput.hash.reverse().toString('hex');
        const vout = txnInput.index;
        let prevOutScript = '';

        if (!this.isCoinbase(txhash)) {
            const prevTransaction = await this.getTransaction(txhash);
            // TODO: check if order is maintained
            prevOutScript = prevTransaction.outs[vout].script.toString('hex');
        }

        return {
            txid: txhash,
            vout,
            scriptSig: txnInput.script.toString('hex'),
            witness: txnInput.witness.map((wit) => wit.toString('hex')),
            prevOutScript,
        };
    }

    private parseTransactionOutput(txnOutput: Output): TransactionOutput {
        return {
            scriptPubKey: txnOutput.script.toString('hex'),
            value: txnOutput.value,
        };
    }
}
