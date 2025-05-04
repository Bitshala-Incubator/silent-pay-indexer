import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { TransactionsService } from '@/transactions/transactions.service';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get('blockHeight/:blockHeight')
    async getTransactionByBlockHeight(
        @Param('blockHeight') blockHeight: number,
        @Query('filterSpent', new ParseBoolPipe({ optional: true }))
        filterSpent = false,
    ) {
        const transactions =
            await this.transactionsService.getTransactionByBlockHeight(
                blockHeight,
                filterSpent,
            );

        return { transactions: transactions };
    }

    @Get('blockHash/:blockHash')
    async getTransactionByBlockHash(
        @Param('blockHash') blockHash: string,
        @Query('filterSpent', new ParseBoolPipe({ optional: true }))
        filterSpent = false,
    ) {
        const transactions =
            await this.transactionsService.getTransactionByBlockHash(
                blockHash,
                filterSpent,
            );

        return { transactions: transactions };
    }
}
