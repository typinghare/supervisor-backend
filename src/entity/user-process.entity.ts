import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_process')
export default class UserProcessEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'bigint', unsigned: true })
    userId: number;

    @Column({ type: 'bigint', unsigned: true })
    taskId: number;
}