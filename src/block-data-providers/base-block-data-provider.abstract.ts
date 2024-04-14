import { CommandBus } from '@nestjs/cqrs';
import {
    IndexTransactionCommand,
    TransactionInput,
    TransactionOutput,
} from '@/commands/index-transaction.command';

export abstract class BaseBlockDataProvider {
    protected constructor(private readonly commandBus: CommandBus) {}

    async indexTransaction(
        txid: string,
        vin: TransactionInput[],
        vout: TransactionOutput[],
        blockHeight: number,
        blockHash: string,
    ): Promise<void> {
        await this.commandBus.execute(
            new IndexTransactionCommand(
                txid,
                vin,
                vout,
                blockHeight,
                blockHash,
            ),
        );
    }
}
