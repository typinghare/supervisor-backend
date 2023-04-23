import { ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpStatus, Put, Query } from '@nestjs/common';
import UserService from '../service/user.service';
import UserProcessDto from '../dto/user-process.dto';
import ResponsePacket from '../common/response-packet';
import UserInfoVo from '../vo/user-info.vo';
import LoginDto from '../dto/login.dto';
import TaskVo from '../vo/task.vo';
import { tokenContainer } from '../common/token';

@ApiTags('supervisor')
@Controller('/supervisor/users')
export default class UserController {
    public constructor(private userService: UserService) {
    }

    @Put('/')
    public async signIn(@Body() loginDto: LoginDto): Promise<ResponsePacket<UserInfoVo>> {
        try {
            const userInfo = await this.userService.signIn(loginDto);
            return new ResponsePacket('User successfully signs in.').data(userInfo);
        } catch (error) {
            return new ResponsePacket('Fail to sign in.').handle(error);
        }
    }

    @Get('/id')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'User\'s id has been fetched.',
        type: UserInfoVo,
    })
    @ApiInternalServerErrorResponse({ description: '' })
    public async fetchUserId(): Promise<ResponsePacket<UserInfoVo>> {
        try {
            const userId = this.userService.getUserId();
            return new ResponsePacket('The id of the user is found.').data({ userId, token: tokenContainer.string });
        } catch (error) {
            return new ResponsePacket('Given token is expired.').handle(error);
        }
    }

    @Get('/selected-tasks')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'The selected task has been fetched.',
        type: TaskVo,
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to fetch the selected task.' })
    public async fetchSelectedTask(@Query('userId') userId: number): Promise<ResponsePacket<TaskVo | null>> {
        try {
            const selectedTask = await this.userService.getSelectedTask(userId);
            return new ResponsePacket('The selected task has been fetched.').data(selectedTask);
        } catch (error) {
            return new ResponsePacket('Fail to fetch the selected task.').handle(error);
        }
    }

    @Put('/selected-tasks')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'The specified task has been switched to.',
    })
    @ApiForbiddenResponse({ description: 'Fail to switch to the specified task.' })
    public async switchTask(@Body() userProcessDto: UserProcessDto): Promise<ResponsePacket> {
        try {
            await this.userService.switchTask(userProcessDto);
            return new ResponsePacket('The specified task has been switched to.');
        } catch (error) {
            return new ResponsePacket('Fail to switch to the specified task.').handle(error);
        }
    }
}