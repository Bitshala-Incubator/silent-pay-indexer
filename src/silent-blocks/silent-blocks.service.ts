import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from '@/transactions/transaction.entity';
import { TransactionsService } from '@/transactions/transactions.service';
import { SILENT_PAYMENT_BLOCK_TYPE } from '@/common/constants';
import { encodeVarInt, varIntSize } from '@/common/common';
import { SilentBlocksGateway } from '@/silent-blocks/silent-blocks.gateway';
import { OnEvent } from '@nestjs/event-emitter';
import { INDEXED_BLOCK_EVENT } from '@/common/events';

@Injectable()
export class SilentBlocksService {
    private readonly logger = new Logger(SilentBlocksService.name);

    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly silentBlocksGateway: SilentBlocksGateway,
    ) {}

    @OnEvent(INDEXED_BLOCK_EVENT)
    async handleBlockIndexedEvent(blockHeight: number) {
        this.logger.debug(`New block indexed: ${blockHeight}`);
        const silentBlock = await this.getSilentBlockByHeight(blockHeight);
        this.silentBlocksGateway.broadcastSilentBlock(silentBlock);
    }

    private getSilentBlockLength(transactions: Transaction[]): number {
        let length = 1 + varIntSize(transactions.length); // 1 byte for type + varint for transactions count

        for (const tx of transactions) {
            length +=
                65 + varIntSize(tx.outputs.length) + tx.outputs.length * 44; // 32 + varint for output count + 44 per output + 33
        }

        return length;
    }

    private encodeSilentBlock(transactions: Transaction[]): Buffer {
        const block = Buffer.alloc(this.getSilentBlockLength(transactions));
        let cursor = 0;

        cursor = block.writeUInt8(SILENT_PAYMENT_BLOCK_TYPE, cursor);
        cursor = encodeVarInt(transactions.length, block, cursor);

        for (const tx of transactions) {
            cursor += block.write(tx.id, cursor, 32, 'hex');
            cursor = encodeVarInt(tx.outputs.length, block, cursor);

            for (const output of tx.outputs) {
                cursor = block.writeBigUInt64BE(BigInt(output.value), cursor);
                cursor += block.write(output.pubKey, cursor, 32, 'hex');
                cursor = block.writeUInt32BE(output.vout, cursor);
            }

            cursor += block.write(tx.scanTweak, cursor, 33, 'hex');
        }

        return block;
    }

    async getSilentBlockByHeight(blockHeight: number): Promise<Buffer> {
        const transactions =
            await this.transactionsService.getTransactionByBlockHeight(
                blockHeight,
            );
        return this.encodeSilentBlock(transactions);
    }

    async getSilentBlockByHash(blockHash: string): Promise<Buffer> {
        const transactions =
            await this.transactionsService.getTransactionByBlockHash(blockHash);
        return this.encodeSilentBlock(transactions);
    }
}
