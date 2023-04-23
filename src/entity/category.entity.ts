import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import SubjectEntity from './subject.entity';
import TaskEntity from './task.entity';

@Entity('category')
export default class CategoryEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    @OneToMany(() => TaskEntity, task => task.categoryId)
    id: number;

    @Column({ type: 'bigint', unsigned: true })
    userId: number;

    @Column({ type: 'bigint', unsigned: true })
    subjectId: number;

    @Column({ type: 'varchar', length: 32 })
    name: string;

    @Column({ type: 'int' })
    expectedDuration: number;

    @ManyToOne(() => SubjectEntity, subject => subject.id)
    subject: SubjectEntity;
}