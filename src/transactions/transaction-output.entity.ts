import { Transaction } from '@/transactions/transaction.entity';
import {
    Entity,
    Column,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    Relation,
} from 'typeorm';
import { TransactionOutput as Output } from '@/indexer/indexer.service';

@Entity()
export class TransactionOutput {
    static fromOutput(output: Output, index: number): TransactionOutput {
        const newOutput = new TransactionOutput();
        newOutput.pubKey = output.scriptPubKey.substring(4);
        newOutput.value = output.value;
        newOutput.vout = index;

        return newOutput;
    }

    @PrimaryColumn({ type: 'varchar', length: 64 }) // 32 bytes * 2 [HEX]
    transactionId: string;

    @PrimaryColumn({ type: 'integer', nullable: false })
    vout: number; // Index of the output in the transaction

    @Column({ type: 'varchar', length: 64 }) // 32 bytes * 2 [HEX]
    pubKey: string; //  Public key associated with the transaction output

    @Column({ type: 'integer', nullable: false })
    value: number; // Value of the output

    @Column({ type: 'boolean', nullable: false, default: false })
    isSpent: boolean;

    @ManyToOne(() => Transaction, (transaction) => transaction.outputs, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'transactionId' })
    transaction: Relation<Transaction>;
}
