import { ApiProperty } from '@nestjs/swagger';

export default class UserInfoVo {
    @ApiProperty({ description: 'The id of the user.' })
    userId: number;

    @ApiProperty({ description: 'The JWT (Json Web Token).' })
    token: string;

    @ApiProperty({ description: 'The username of the user.' })
    username: string;
}