import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from '@/transactions/transaction.entity';
import { TransactionsService } from '@/transactions/transactions.service';
import { SILENT_PAYMENT_BLOCK_TYPE } from '@/common/constants';
import { encodeVarInt, varIntSize } from '@/common/common';
import { SilentBlocksGateway } from '@/silent-blocks/silent-blocks.gateway';
import { OnEvent } from '@nestjs/event-emitter';
import { INDEXED_BLOCK_EVENT } from '@/common/events';
import { BlockStateService } from '@/block-state/block-state.service';
import { createView, hexToUint8Array } from '@/common/uint8array';

@Injectable()
export class SilentBlocksService {
    private readonly logger = new Logger(SilentBlocksService.name);

    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly silentBlocksGateway: SilentBlocksGateway,
        private readonly blockStateService: BlockStateService,
    ) {}

    @OnEvent(INDEXED_BLOCK_EVENT)
    async handleBlockIndexedEvent(blockHeight: number) {
        this.logger.debug(`New block indexed: ${blockHeight}`);
        const silentBlock = await this.getSilentBlockByHeight(
            blockHeight,
            false,
        );
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

    public encodeSilentBlock(transactions: Transaction[]): Uint8Array {
        const block = new Uint8Array(this.getSilentBlockLength(transactions));
        const view = createView(block);
        let cursor = 0;

        view.setUint8(cursor, SILENT_PAYMENT_BLOCK_TYPE);
        cursor += 1;
        cursor = encodeVarInt(transactions.length, block, cursor);

        for (const tx of transactions) {
            // Write txid (32 bytes)
            block.set(hexToUint8Array(tx.id), cursor);
            cursor += 32;
            cursor = encodeVarInt(tx.outputs.length, block, cursor);

            for (const output of tx.outputs) {
                // Write value as BigUint64BE
                const valueView = createView(block, cursor);
                valueView.setBigUint64(0, BigInt(output.value), false); // false = big endian
                cursor += 8;

                // Write pubKey (32 bytes)
                block.set(hexToUint8Array(output.pubKey), cursor);
                cursor += 32;

                // Write vout as Uint32BE
                const voutView = createView(block, cursor);
                voutView.setUint32(0, output.vout, false); // false = big endian
                cursor += 4;
            }

            // Write scanTweak (33 bytes)
            block.set(hexToUint8Array(tx.scanTweak), cursor);
            cursor += 33;
        }

        return block;
    }

    async getSilentBlockByHeight(
        blockHeight: number,
        filterSpent: boolean,
    ): Promise<Uint8Array> {
        const transactions =
            await this.transactionsService.getTransactionByBlockHeight(
                blockHeight,
                filterSpent,
            );

        return this.encodeSilentBlock(transactions);
    }

    async getSilentBlockByHash(
        blockHash: string,
        filterSpent: boolean,
    ): Promise<Buffer> {
        const transactions =
            await this.transactionsService.getTransactionByBlockHash(
                blockHash,
                filterSpent,
            );

        return this.encodeSilentBlock(transactions);
    }

    async getLatestIndexedBlockHeight(): Promise<number> {
        const currentBlockState =
            await this.blockStateService.getCurrentBlockState();
        return currentBlockState?.blockHeight ?? 0;
    }
}
