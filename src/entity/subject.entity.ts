import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import CategoryEntity from './category.entity';

@Entity('subject')
export default class SubjectEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    @OneToMany(() => CategoryEntity, category => category.subjectId)
    id: number;

    @Column({ type: 'bigint', unsigned: true })
    userId: number;

    @Column({ type: 'varchar', length: 32 })
    name: string;
}