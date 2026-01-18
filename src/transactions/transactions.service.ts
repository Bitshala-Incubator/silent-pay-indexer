import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '@/transactions/transaction.entity';
import { DeleteResult, Repository, Between } from 'typeorm';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) {}

    async getTransactionByBlockHeight(
        blockHeight: number,
        filterSpent: boolean,
    ): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: {
                blockHeight,
                ...(filterSpent && {
                    outputs: {
                        isSpent: !filterSpent,
                    },
                }),
            },
            relations: { outputs: true },
        });
    }

    async getTransactionsByBlockHeightRange(
        startHeight: number,
        endHeight: number,
        filterSpent: boolean,
    ): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: {
                blockHeight: Between(startHeight, endHeight),
                ...(filterSpent && {
                    outputs: {
                        isSpent: !filterSpent,
                    },
                }),
            },
            relations: { outputs: true },
            order: {
                blockHeight: 'ASC',
            },
        });
    }

    async getTransactionByBlockHash(
        blockHash: string,
        filterSpent: boolean,
    ): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: {
                blockHash,
                ...(filterSpent && {
                    outputs: {
                        isSpent: !filterSpent,
                    },
                }),
            },
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
