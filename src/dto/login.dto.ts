import { ApiProperty } from '@nestjs/swagger';

export default class LoginDto {
    @ApiProperty({
        description: 'Username.',
        maxLength: 16,
    })
    username: string;

    @ApiProperty({
        description: 'User\'s password.',
        maxLength: 16,
    })
    password: string;
}
