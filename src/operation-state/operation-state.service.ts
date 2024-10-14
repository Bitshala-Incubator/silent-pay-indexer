import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OperationState } from '@/operation-state/operation-state.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OperationStateService {
    private cacheSize = 2016; // Define the maximum cache size

    constructor(
        @InjectRepository(OperationState)
        private readonly operationStateRepository: Repository<OperationState>,
    ) {}

    async getCurrentOperationState(): Promise<OperationState> {
        const state = (
            await this.operationStateRepository.find({
                order: {
                    indexedBlockHeight: 'DESC',
                },
                take: 1,
            })
        )[0];

        return state;
    }

    async setOperationState(state: any): Promise<void> {
        const operationState = new OperationState();
        operationState.indexedBlockHash = state.indexedBlockHash;
        operationState.indexedBlockHeight = state.indexedBlockHeight;
        operationState.providerState = state.providerState;
        this.operationStateRepository.save(operationState);

        // Ensure the cache size does not exceed 2016
        await this.trimState();
    }

    // Remove and return the oldest item in the state cache
    async dequeue_operation_state(): Promise<OperationState | null> {
        const latest_state = (
            await this.operationStateRepository.find({
                order: {
                    indexedBlockHeight: 'DESC',
                },
                take: 1,
            })
        )[0];

        if (latest_state) {
            await this.operationStateRepository.remove(latest_state);
            return latest_state;
        }

        return null;
    }

    private async trimState(): Promise<void> {
        const queueCount = await this.operationStateRepository.count();

        if (queueCount > this.cacheSize) {
            // Delete the oldest entries from the cache
            const old_states = await this.operationStateRepository.find({
                order: {
                    indexedBlockHeight: 'ASC',
                },
                take: queueCount - this.cacheSize,
            });
            await this.operationStateRepository.delete(
                old_states.map((state) => state.indexedBlockHeight),
            );
        }
    }
}
