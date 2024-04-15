import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IndexTransactionCommand } from '@/commands/impl/index-transaction.command';

@CommandHandler(IndexTransactionCommand)
export class IndexTransactionHandler
    implements ICommandHandler<IndexTransactionCommand>
{
    async execute(command: IndexTransactionCommand) {
        throw new Error(`Method not implemented. Command: ${command}`);
    }
}
