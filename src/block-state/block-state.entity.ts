import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BlockState {
    @PrimaryColumn('integer')
    blockHeight: number;

    @Column({ type: 'varchar', length: 64 }) // 32 bytes * 2 [HEX]
    blockHash: string;
}
