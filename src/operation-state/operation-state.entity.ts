import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OperationState {
    @PrimaryColumn('text')
    id: string;

    @Column('simple-json')
    state: any;

}
