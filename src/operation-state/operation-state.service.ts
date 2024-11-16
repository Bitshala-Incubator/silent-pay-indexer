import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OperationState } from '@/operation-state/operation-state.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OperationStateService {
    constructor(
        @InjectRepository(OperationState)
        private readonly operationStateRepository: Repository<OperationState>,
    ) {}

    async getOperationState(id: string): Promise<OperationState> {
        return this.operationStateRepository.findOneBy({ id: id });
    }
}
