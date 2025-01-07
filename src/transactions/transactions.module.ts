import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from '@/transactions/transactions.service';
import {
    Transaction,
    TransactionOutput,
} from '@/transactions/transaction.entity';
import { TransactionController } from '@/transactions/transactions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, TransactionOutput])],
    controllers: [TransactionController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
