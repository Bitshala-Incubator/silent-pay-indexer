import { Column, Entity, PrimaryColumn } from 'typeorm';

export type TransactionOutput = {
    pubKey: string;
    vout: number;
    value: number;
};

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

    @Column({ type: 'jsonb', nullable: false })
    outputs: TransactionOutput[];

    @Column({ type: 'boolean', nullable: false })
    isSpent: boolean;
}
