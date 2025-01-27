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
            return this.transactionRepository
                .createQueryBuilder('transaction')
                .leftJoinAndSelect('transaction.outputs', 'output') // Join outputs to include them in the results
                .where('transaction.blockHash = :blockHash', { blockHash })
                .andWhere(
                    'transaction.id IN (' +
                        this.transactionRepository
                            .createQueryBuilder('subTransaction')
                            .select('subTransaction.id')
                            .leftJoin('subTransaction.outputs', 'subOutput')
                            .where('subOutput.isSpent = false')
                            .getQuery() +
                        ')',
                )
                .getMany();
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
