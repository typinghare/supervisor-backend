import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Param, Put } from '@nestjs/common';
import TaskService from '../service/task.service';
import ResponsePacket from '../common/response-packet';
import TaskCommentDto from '../dto/task-comment.dto';


@ApiTags('supervisor')
@Controller('/supervisor/task-comments')
export default class TaskCommentController {
    constructor(private taskService: TaskService) {
    }

    @Put('/:commentId')
    async updateComment(@Param('commentId') commentId: number, @Body() taskCommentDto: TaskCommentDto): Promise<ResponsePacket> {
        try {
            const result = await this.taskService.updateComment(commentId, taskCommentDto);
            return new ResponsePacket('The comment has been updated').data(result);
        } catch (error) {
            return new ResponsePacket('Fail to update the comment.').handle(error);
        }
    }

    @Delete('/:commentId')
    async removeComment(@Param('commentId') commentId: number): Promise<ResponsePacket<void>> {
        try {
            await this.taskService.removeComment(commentId);
            return new ResponsePacket('The comment has been removed.');
        } catch (error) {
            return new ResponsePacket('Fail to remove the comment.').handle(error);
        }
    }
}