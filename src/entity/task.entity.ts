import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Stage } from '../common/enum';
import CategoryEntity from './category.entity';
import TaskCommentEntity from './task-comment.entity';

@Entity('task')
export default class TaskEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'bigint', unsigned: true })
    userId: number;

    @Column({ type: 'bigint', unsigned: true })
    categoryId: number;

    @Column({ type: 'tinyint', enum: Stage })
    stage: number;

    @Column({ type: 'datetime', nullable: true })
    startedAt: Date | null;

    @Column({ type: 'datetime', nullable: true })
    endedAt: Date | null;

    @Column({ type: 'datetime', nullable: true })
    lastResumeAt: Date | null;

    @Column({ type: 'int' })
    duration: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'datetime', nullable: true })
    deletedAt: Date | null;

    @ManyToOne(() => CategoryEntity, category => category.id)
    category: CategoryEntity;

    @OneToMany(() => TaskCommentEntity, taskComment => taskComment.task)
    taskCommentList: TaskCommentEntity[];
}