import { ApiProperty } from '@nestjs/swagger';
import { Stage } from '../common/enum';
import TaskCommentVo from './task-comment.vo';

export default class TaskVo {
    @ApiProperty({ description: 'The id of the task.' })
    id: number;

    @ApiProperty({ description: 'The stage of the task.', enum: Stage })
    stage: number;

    @ApiProperty({ description: 'The started time of the task.' })
    startedAt: Date;

    @ApiProperty({ description: 'The last resume time of the task.' })
    lastResumeAt: Date;

    @ApiProperty({ description: 'The ended time of the task.' })
    endedAt: Date;

    @ApiProperty({ description: 'The duration in minute so far.' })
    duration: number;

    @ApiProperty({ description: 'The created time of the task.' })
    createdAt: Date;

    @ApiProperty({ description: 'The id of the category that the task belongs to.' })
    categoryId: number;

    @ApiProperty({ description: 'The name of the category that the task belongs to.' })
    categoryName: string;

    @ApiProperty({ description: 'The expected duration in minute of the task.' })
    expectedDuration: number;

    @ApiProperty({ description: 'The name of the subject that the task belongs to.' })
    subjectName: string;

    commentList: TaskCommentVo[];
}