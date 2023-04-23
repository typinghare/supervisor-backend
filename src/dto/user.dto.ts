import { ApiProperty } from '@nestjs/swagger';

export default class UserDto {
    @ApiProperty({
        description: '',
        maxLength: 32,
    })
    name: string;
}