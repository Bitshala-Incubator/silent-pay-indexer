import { Module } from '@nestjs/common';
import { OperationStateService } from '@/operation-state/operation-state.service';

@Module({
    providers: [OperationStateService],
    exports: [OperationStateService],
})
export class OperationStateModule {}
