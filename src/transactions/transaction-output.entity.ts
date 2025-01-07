import { Transaction } from '@/transactions/transaction.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class TransactionOutput {
    @PrimaryGeneratedColumn()
    id: number; // Auto-generated primary key

    @Column({ type: 'text', nullable: false })
    pubKey: string; // Public key associated with the transaction output

    @Column({ type: 'integer', nullable: false })
    vout: number; // Index of the output in the transaction

    @Column({ type: 'integer', nullable: false })
    value: number; // Value of the output

    @Column({ type: 'boolean', nullable: false, default: false })
    isSpent: boolean;

    @ManyToOne(() => Transaction, (transaction) => transaction.outputs, {
        eager: true,
        onDelete: 'CASCADE',
    })
    transaction: Transaction;
}
