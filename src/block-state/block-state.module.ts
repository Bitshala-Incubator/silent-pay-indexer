import { Module } from '@nestjs/common';
import { BlockStateService } from '@/block-state/block-state.service';

@Module({
    providers: [BlockStateService],
    exports: [BlockStateService],
})
export class BlockStateModule {}
