import { TransactionOutput } from '@/transactions/transaction-output.entity';
import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

@Entity()
export class Transaction {
    @PrimaryColumn('text')
    id: string; // txid

    @Column({ type: 'integer', nullable: false })
    blockHeight: number;

    @Column({ type: 'text', nullable: false })
    blockHash: string;

    @Column({ type: 'text', nullable: false })
    scanTweak: string;

    @OneToMany(() => TransactionOutput, (output) => output.transaction, {
        eager: true,
        cascade: true,
    })
    outputs: Relation<TransactionOutput[]>;
}
