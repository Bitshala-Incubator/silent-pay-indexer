import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from '@/transactions/transactions.service';
import { Transaction } from '@/transactions/transaction.entity';
import { TransactionController } from '@/transactions/transactions.controller';
import { TransactionOutput } from '@/transactions/transaction-output.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, TransactionOutput])],
    controllers: [TransactionController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
