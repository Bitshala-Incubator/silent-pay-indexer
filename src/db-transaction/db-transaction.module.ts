import { Module } from '@nestjs/common';
import { DbTransactionService } from '@/db-transaction/db-transaction.service';

@Module({
    providers: [DbTransactionService],
    exports: [DbTransactionService],
})
export class DbTransactionModule {}
