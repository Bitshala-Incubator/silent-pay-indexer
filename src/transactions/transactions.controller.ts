import { Controller, Get, Param } from '@nestjs/common';
import { TransactionsService } from '@/transactions/transactions.service';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get('blockHeight/:blockHeight')
    async getTransactionByBlockHeight(
        @Param('blockHeight') blockHeight: number,
    ) {
        const transactions =
            await this.transactionsService.getTransactionByBlockHeight(
                blockHeight,
                false,
            );

        return { transactions: transactions };
    }

    @Get('blockHash/:blockHash')
    async getTransactionByBlockHash(@Param('blockHash') blockHash: string) {
        const transactions =
            await this.transactionsService.getTransactionByBlockHash(
                blockHash,
                false,
            );

        return { transactions: transactions };
    }
}
