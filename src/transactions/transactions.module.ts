import { Module } from '@nestjs/common';
import { TransactionsService } from '@/transactions/transactions.service';
import { TransactionController } from '@/transactions/transactions.controller';

@Module({
    controllers: [TransactionController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
