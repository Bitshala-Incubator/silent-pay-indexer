import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BlockState {
    @PrimaryColumn('integer')
    blockHeight: number;

    @Column('text')
    blockHash: string;
}
