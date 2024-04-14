import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from '@/transactions/transactions.service';
import { Transaction } from '@/transactions/transaction.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction])],
    controllers: [],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
