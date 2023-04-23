import { ApiProperty } from '@nestjs/swagger';
import { Stage } from '../common/enum';

export default class TaskDto {
    @ApiProperty({
        description: 'The id of category where the task belongs.',
    })
    categoryId: number;

    @ApiProperty({
        description: 'The id of user where the task belongs.',
    })
    userId: number;

    @ApiProperty({
        description: 'The stage of the task.',
        enum: Stage,
    })
    stage: number;

    @ApiProperty({
        description: 'The date. (MM-DD-YYYY)',
    })
    selectedDate: string;
}