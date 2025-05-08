import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { TransactionsService } from '@/transactions/transactions.service';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get('blockHeight/:blockHeight')
    @UseInterceptors(CacheInterceptor)
    async getTransactionByBlockHeight(
        @Param('blockHeight') blockHeight: number,
    ) {
        const transactions =
            await this.transactionsService.getTransactionByBlockHeight(
                blockHeight,
            );

        return { transactions: transactions };
    }

    @Get('blockHash/:blockHash')
    @UseInterceptors(CacheInterceptor)
    async getTransactionByBlockHash(@Param('blockHash') blockHash: string) {
        const transactions =
            await this.transactionsService.getTransactionByBlockHash(blockHash);

        return { transactions: transactions };
    }
}
