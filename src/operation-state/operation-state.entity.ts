import { Column, Entity, PrimaryColumn } from 'typeorm';
import configuration from '@/configuration';

const operationTableName = `${configuration()['providerType']}_operation_state`;

@Entity(operationTableName)
export class OperationState {
    @PrimaryColumn('integer')
    indexedBlockHeight: number;

    @Column('text')
    indexedBlockHash: string;

    @Column({ type: 'simple-json', nullable: true })
    providerState: unknown;
}
