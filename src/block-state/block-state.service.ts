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

    async removeState(state: BlockState): Promise<void> {
        await this.blockStateRepository.delete(state.blockHeight);
        await this.transactionService.deleteTransactionByBlockHash(
            state.blockHash,
        );
    }
}
