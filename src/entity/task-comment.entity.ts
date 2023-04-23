import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import TaskEntity from './task.entity';

@Entity('task_comment')
export default class TaskCommentEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'bigint', unsigned: true })
    taskId: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'bool', default: false })
    isPinned: boolean;

    @Column({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'datetime' })
    updatedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    deletedAt: Date;

    @ManyToOne(() => TaskEntity, task => task.taskCommentList)
    task: TaskEntity;
}