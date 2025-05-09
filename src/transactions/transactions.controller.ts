import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { TransactionsService } from '@/transactions/transactions.service';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get('height/:height')
    async getTransactionByBlockHeight(
        @Param('height') blockHeight: number,
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

    @Get('hash/:hash')
    async getTransactionByBlockHash(
        @Param('hash') blockHash: string,
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
