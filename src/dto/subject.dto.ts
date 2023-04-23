import { ApiProperty } from '@nestjs/swagger';

export default class SubjectDto {
    @ApiProperty({
        description: 'The id of the subject.',
        maxLength: 16,
    })
    id: number;

    @ApiProperty({
        description: 'The id of the user who owns the subject.',
        maxLength: 16,
    })
    userId: number;

    @ApiProperty({
        description: 'The name of the subject.',
        maxLength: 32,
    })
    name: string;
}
