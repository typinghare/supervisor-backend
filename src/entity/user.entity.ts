import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export default class UserEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 32 })
    username: string;

    @Column({ type: 'varchar', length: 32 })
    authString: string;

    @Column({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'datetime' })
    deletedAt: Date;
}