import { Module } from '@nestjs/common';
import { DbTransactionService } from '@/db-transaction/db-transaction.service';

@Module({
    imports: [],
    controllers: [],
    providers: [DbTransactionService],
    exports: [DbTransactionService],
})
export class DbTransactionModule {}
