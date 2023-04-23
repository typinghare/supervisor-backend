import { ApiProperty } from '@nestjs/swagger';

export default class TaskCommentDto {
    @ApiProperty({
        description: 'The id of comment.',
    })
    id: number;

    @ApiProperty({
        description: 'The id of corresponding task.',
    })
    taskId: number;

    @ApiProperty({
        description: 'The content of the comment.',
    })
    content: string;

    @ApiProperty({
        description: 'Whether the comment is a pinned comment.',
    })
    isPinned: boolean;
}