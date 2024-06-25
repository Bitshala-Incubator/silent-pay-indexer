import { Module } from '@nestjs/common';
import { TransactionsModule } from '@/transactions/transactions.module';
import { IndexerService } from '@/indexer/indexer.service';

@Module({
    imports: [TransactionsModule],
    controllers: [],
    providers: [IndexerService],
    exports: [IndexerService],
})
export class IndexerModule {}
