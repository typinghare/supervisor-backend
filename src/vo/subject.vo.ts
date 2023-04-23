import { ApiProperty } from '@nestjs/swagger';

export default class SubjectVo {
    @ApiProperty({ description: 'The id of the subject.' })
    id: number;

    @ApiProperty({ description: 'The name of the subject.' })
    name: string;
}