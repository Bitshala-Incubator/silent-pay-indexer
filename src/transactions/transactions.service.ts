import { Injectable, NotFoundException } from '@nestjs/common';
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
                        isSpent: false,
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
                        isSpent: false,
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
                        isSpent: false,
                    },
                }),
            },
            relations: { outputs: true },
        });
    }

    async getTransactionByTxid(
        txid: string,
        filterSpent: boolean,
    ): Promise<Transaction | null> {
        return this.transactionRepository.findOne({
            where: {
                id: txid,
                ...(filterSpent && { outputs: { isSpent: false } }),
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

    async getBlockHeightByTimestamp(
        timestamp: number,
    ): Promise<{ blockHeight: number }> {
        const transaction = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('transaction.blockHeight', 'blockHeight')
            .where('transaction.blockTime > :timestamp', { timestamp })
            .orderBy('transaction.blockTime', 'ASC')
            .getRawOne<{ blockHeight: number }>();

        if (!transaction) {
            throw new NotFoundException(
                'No block found after the given timestamp',
            );
        }

        return transaction;
    }
}
