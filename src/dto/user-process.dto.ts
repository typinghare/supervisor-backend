import { ApiProperty } from '@nestjs/swagger';

export default class UserProcessDto {
    @ApiProperty({
        description: 'The id of the task to be switched.',
    })
    taskId: number;
}