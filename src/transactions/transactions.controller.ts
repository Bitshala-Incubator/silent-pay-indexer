import { CacheInterceptor } from '@nestjs/cache-manager';
import {
    BadRequestException,
    Controller,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { TransactionsService } from '@/transactions/transactions.service';
import { MAX_BLOCK_RANGE } from '@/common/constants';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get('height/:height')
    @UseInterceptors(CacheInterceptor)
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

    @Get('range')
    @UseInterceptors(CacheInterceptor)
    async getTransactionsByBlockHeightRange(
        @Query('startHeight', ParseIntPipe) startHeight: number,
        @Query('endHeight', ParseIntPipe) endHeight: number,
        @Query('filterSpent', new ParseBoolPipe({ optional: true }))
        filterSpent = false,
    ) {
        if (startHeight < 0 || endHeight < 0) {
            throw new BadRequestException('Block heights must be non-negative');
        }

        if (startHeight > endHeight) {
            throw new BadRequestException(
                'startHeight must be less than or equal to endHeight',
            );
        }

        if (endHeight - startHeight + 1 > MAX_BLOCK_RANGE) {
            throw new BadRequestException(
                `Range too large. Maximum allowed range is ${MAX_BLOCK_RANGE} blocks`,
            );
        }

        const transactions =
            await this.transactionsService.getTransactionsByBlockHeightRange(
                startHeight,
                endHeight,
                filterSpent,
            );

        return { transactions: transactions };
    }

    @Get('hash/:hash')
    @UseInterceptors(CacheInterceptor)
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

    @Get('timestamp-to-height')
    @UseInterceptors(CacheInterceptor)
    async getBlockHeightByTimestamp(
        @Query('timestamp', ParseIntPipe) timestamp: number,
    ) {
        return await this.transactionsService.getBlockHeightByTimestamp(
            timestamp,
        );
    }
}
