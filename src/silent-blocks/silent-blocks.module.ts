import { Module } from '@nestjs/common';
import { TransactionsModule } from '@/transactions/transactions.module';
import { SilentBlocksController } from '@/silent-blocks/silent-blocks.controller';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';
import { SilentBlocksGateway } from '@/silent-blocks/silent-blocks.gateway';
import { BlockStateModule } from '@/block-state/block-state.module';

@Module({
    imports: [TransactionsModule, BlockStateModule],
    providers: [SilentBlocksService, SilentBlocksGateway],
    controllers: [SilentBlocksController],
    exports: [SilentBlocksService],
})
export class SilentBlocksModule {}
