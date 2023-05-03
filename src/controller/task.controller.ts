import {
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import TaskService from '../service/task.service';
import TaskVo from '../vo/task.vo';
import TaskDto from '../dto/task.dto';
import TaskCommentVo from '../vo/task-comment.vo';
import TaskCommentDto from '../dto/task-comment.dto';
import ResponsePacket from '../common/response-packet';

@ApiTags('supervisor')
@Controller('/supervisor/tasks')
export default class TaskController {
    public constructor(private taskService: TaskService) {
    }

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({
        description: 'The task has been created.',
        type: TaskVo,
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to create the task.' })
    public async createTask(@Body() taskDto: TaskDto): Promise<ResponsePacket<TaskVo>> {
        try {
            const task = await this.taskService.createTask(taskDto);
            return new ResponsePacket('The task has been created.').data(task);
        } catch (error) {
            return new ResponsePacket('Fail to create the task.').handle(error);
        }
    }

    @Delete('/:taskId')
    public async removeTask(@Param('taskId') taskId: number): Promise<ResponsePacket<void>> {
        try {
            await this.taskService.removeTask(taskId);
            return new ResponsePacket('Successfully remove the task.');
        } catch (error) {
            return new ResponsePacket('Fail to remove task.').handle(error);
        }
    }

    @Get('/:taskId')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'The task has been fetched.',
        type: TaskVo,
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to fetch the task.' })
    public async fetchTask(@Param('taskId') taskId: number): Promise<ResponsePacket<TaskVo>> {
        try {
            const task = await this.taskService.fetchTaskById(taskId);

            if (!task) {
                return new ResponsePacket().handle(new HttpException('The task is not found', HttpStatus.NOT_FOUND));
            }

            const taskVo = this.taskService.getTaskVo(task);
            taskVo.commentList = await this.taskService.fetchComments(task.id);

            return new ResponsePacket('The task has been created.').data(taskVo);
        } catch (error) {
            return new ResponsePacket('Fail to fetch the task.').handle(error);
        }
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'The tasks have been fetched.',
        type: [TaskVo],
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to fetch tasks.' })
    public async fetchTaskPaged(@Query() taskDto: TaskDto): Promise<ResponsePacket<TaskVo[]>> {
        try {
            const tasks = await this.taskService.fetchTaskPaged(taskDto);
            return new ResponsePacket('The tasks have been fetched.').data(tasks);
        } catch (error) {
            console.log(error.message);
            return new ResponsePacket('Fail to fetch tasks.').handle(error);
        }
    }

    @Put('/:taskId')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'The stage of task has been updated',
        type: null,
    })
    @ApiNotFoundResponse({ description: 'The task is not found.' })
    @ApiForbiddenResponse({ description: 'You cannot update a task which is not yours.' })
    @ApiForbiddenResponse({ description: 'You cannot update the stage of the task with this specified action.' })
    @ApiInternalServerErrorResponse({ description: 'Fail to update the stage of the task.' })
    public async updateTaskStage(@Param('taskId') taskId: string, @Body('action') action: string): Promise<ResponsePacket<TaskVo>> {
        try {
            const taskVo = await this.taskService.updateTaskStage(parseInt(taskId), parseInt(action));
            return new ResponsePacket('The stage of task has been updated').data(taskVo);
        } catch (error) {
            return new ResponsePacket('Fail to update the stage of the task.').handle(error);
        }
    }

    @Post('/:taskId/comments')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({
        description: 'The comment has been posted.',
        type: TaskCommentVo,
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to post the comment.' })
    public async postComment(@Param('taskId') taskId: number, @Body() taskCommentDto: TaskCommentDto): Promise<ResponsePacket<TaskCommentVo>> {
        try {
            taskCommentDto.taskId = taskId;
            const comment = await this.taskService.postComment(taskCommentDto);
            return new ResponsePacket('The comment has been posted.').data(comment);
        } catch (error) {
            return new ResponsePacket('Fail to post the comment.').handle(error);
        }
    }

    @Get('/:taskId/comments')
    @ApiOkResponse({
        description: 'Comments of the task have been fetched.',
        type: [TaskCommentVo],
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to fetch comments of the task.' })
    public async fetchComments(@Param('taskId') taskId: number): Promise<ResponsePacket<TaskCommentVo[]>> {
        try {
            const taskComments = await this.taskService.fetchComments(taskId);
            return new ResponsePacket('Comments of the task have been fetched.').data(taskComments);
        } catch (error) {
            return new ResponsePacket('Fail to fetch comments of the task.').handle(error);
        }
    }
}