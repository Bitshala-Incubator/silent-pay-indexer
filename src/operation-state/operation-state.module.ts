import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationState } from '@/operation-state/operation-state.entity';
import { OperationStateService } from '@/operation-state/operation-state.service';

@Module({
    imports: [TypeOrmModule.forFeature([OperationState])],
    controllers: [],
    providers: [OperationStateService],
    exports: [OperationStateService],
})
export class OperationStateModule {}
