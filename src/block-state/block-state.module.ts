import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockState } from '@/block-state/block-state.entity';
import { BlockStateService } from '@/block-state/block-state.service';
import { TransactionsModule } from '@/transactions/transactions.module';

@Module({
    imports: [TypeOrmModule.forFeature([BlockState]), TransactionsModule],
    controllers: [],
    providers: [BlockStateService],
    exports: [BlockStateService],
})
export class BlockStateModule {}
