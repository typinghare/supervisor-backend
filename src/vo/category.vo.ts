import { ApiProperty } from '@nestjs/swagger';

export default class CategoryVo {
    @ApiProperty({ description: 'The id of the category.' })
    id: number;

    @ApiProperty({ description: 'The name of the category.' })
    name: string;

    @ApiProperty({ description: 'Duration in minutes.' })
    expectedDuration: number;
}