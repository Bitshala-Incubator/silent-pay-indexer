import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '@/transactions/transaction.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) {}

    async getTransactionByBlockHeight(
        blockHeight: number,
    ): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: { blockHeight },
            relations: { outputs: true },
        });
    }

    async getTransactionByBlockHash(
        blockHash: string,
        filterSpent: boolean,
    ): Promise<Transaction[]> {
        if (filterSpent) {
            return this.transactionRepository.find({
                where: {
                    blockHash: blockHash,
                    ...(filterSpent && {
                        outputs: {
                            isSpent: !filterSpent,
                        },
                    }),
                },
                relations: { outputs: true },
            });
        }

        return this.transactionRepository.find({
            where: { blockHash },
            relations: { outputs: true },
        });
    }

    async saveTransaction(transaction: Transaction): Promise<Transaction> {
        return this.transactionRepository.save(transaction);
    }

    async deleteTransactionByBlockHash(
        blockHash: string,
    ): Promise<DeleteResult> {
        return this.transactionRepository.delete({ blockHash });
    }
}
