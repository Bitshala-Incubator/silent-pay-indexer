import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '@/transactions/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) {}

    async getTransactionByBlockHeight(
        blockHeight: number,
    ): Promise<Transaction[]> {
        return this.transactionRepository.find({ where: { blockHeight } });
    }

    async getTransactionByBlockHash(blockHash: string): Promise<Transaction[]> {
        return this.transactionRepository.find({ where: { blockHash } });
    }
}
