import { ApiProperty } from '@nestjs/swagger';

export default class TaskCommentVo {
    @ApiProperty({ description: 'The id of the comment.' })
    id: number;

    @ApiProperty({ description: 'The name of the comment.' })
    content: string;

    @ApiProperty({ description: 'Whether the comment is pinned.' })
    isPinned: boolean;

    @ApiProperty({ description: 'The created time of the comment.' })
    createdAt: Date;

    @ApiProperty({ description: 'The last time of the comment.' })
    updatedAt: Date;
}