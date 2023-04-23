import { ApiProperty } from '@nestjs/swagger';

export default class CategoryDto {
    @ApiProperty({
        description: 'The id of the category.',
        maxLength: 16,
    })
    id: number;

    @ApiProperty({
        description: 'The id of the subject.',
        maxLength: 16,
    })
    subjectId: number;

    @ApiProperty({
        description: 'The name of the category.',
        maxLength: 32,
    })
    name: string;

    @ApiProperty({
        description: 'Duration in minutes.',
    })
    expectedDuration: number;
}
