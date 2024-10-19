import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BlockState } from '@/block-state/block-state.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsService } from '@/transactions/transactions.service';

@Injectable()
export class BlockStateService {
    constructor(
        @InjectRepository(BlockState)
        private readonly blockStateRepository: Repository<BlockState>,
        private readonly transactionService: TransactionsService,
    ) {}

    async getCurrentBlockState(): Promise<BlockState> {
        return (
            await this.blockStateRepository.find({
                order: {
                    blockHeight: 'DESC',
                },
                take: 1,
            })
        )[0];
    }

    async addBlockState(state: BlockState): Promise<void> {
        await this.blockStateRepository.save(state);
    }

    // Remove and return the latest item in the state cache
    async dequeueState(): Promise<BlockState | null> {
        const latestState = (
            await this.blockStateRepository.find({
                order: {
                    blockHeight: 'DESC',
                },
                take: 1,
            })
        )[0];

        if (latestState) {
            await this.blockStateRepository.remove({ ...latestState });
            await this.transactionService.deleteTransactionByBlockHash(
                latestState.blockHash,
            );
        }

        return latestState;
    }
}
