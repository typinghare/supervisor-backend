import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DB } from '../common/database';
import UserProcessEntity from '../entity/user-process.entity';
import UserProcessDto from '../dto/user-process.dto';
import { UpdateResult } from 'typeorm';
import TaskService from './task.service';
import { JWT_SECRET, tokenContainer } from '../common/token';
import UserEntity from '../entity/user.entity';
import * as jwt from 'jsonwebtoken';
import UserInfoVo from '../vo/user-info.vo';
import LoginDto from '../dto/login.dto';
import TaskVo from '../vo/task.vo';
import { Action, Stage } from '../common/enum';
import { getAuthString } from '../common/helper';

@Injectable()
export default class UserService {
    public constructor(private taskService: TaskService) {
    }

    /**
     * Get the id of user via token given.
     */
    getUserId(): number {
        const tokenPayload = tokenContainer.payload;
        if (!tokenPayload) {
            throw new HttpException('Missing token.', HttpStatus.BAD_REQUEST);
        }
        return tokenPayload.userId;
    }

    /**
     * Users login.
     * @param loginDto
     */
    async signIn(loginDto: LoginDto): Promise<UserInfoVo> {
        const user = await DB.getRepository(UserEntity)
            .createQueryBuilder()
            .where({ username: loginDto.username })
            .getOne();

        if (!user) {
            throw new HttpException('Username does not exist.', HttpStatus.NOT_FOUND);
        }

        if (user.authString !== getAuthString(loginDto.password)) {
            throw new HttpException('Password is incorrect.', HttpStatus.FORBIDDEN);
        }

        return {
            userId: user.id,
            token: jwt.sign({ userId: user.id }, JWT_SECRET),
            username: user.username,
        };
    }

    /**
     * Get the selected task.
     */
    async getUserProcess(userId?: number): Promise<UserProcessEntity | null> {
        userId = userId || this.getUserId();

        return await DB.getRepository(UserProcessEntity)
            .createQueryBuilder()
            .where('user_id = :userId', { userId })
            .getOne();
    }

    /**
     * Get the selected task.
     */
    async getSelectedTask(userId?: number): Promise<TaskVo | null> {
        userId = userId || this.getUserId();

        const userProcess = await this.getUserProcess(userId);
        if (!userProcess) return null;

        const task = await this.taskService.fetchTaskById(userProcess.taskId);
        return task ? this.taskService.getTaskVo(task) : null;
    }

    /**
     * Switch the task.
     * @param userProcessDto
     */
    async switchTask(userProcessDto: UserProcessDto): Promise<UpdateResult> {
        const userId = this.getUserId();

        // If user-process record does not exist, create one.
        if (!await this.getUserProcess(userId)) {
            await DB.createQueryBuilder()
                .insert()
                .into(UserProcessEntity)
                .values(userProcessDto)
                .execute();
        }

        // get the selected task, pause it if it's ongoing
        const selectedTask = await this.getSelectedTask(userId);
        if (selectedTask !== null) {
            if (selectedTask.stage === Stage.ONGOING) {
                await this.taskService.updateTaskStage(selectedTask.id, Action.PAUSE);
            }
        }

        return await DB.createQueryBuilder()
            .update(UserProcessEntity)
            .set({ taskId: userProcessDto.taskId })
            .where('user_id = :userId', { userId })
            .execute();
    }

    async removeSelectedTask(): Promise<void> {
        const userId = this.getUserId();

        await DB.createQueryBuilder()
            .update(UserProcessEntity)
            .set({ taskId: null })
            .where('user_id = :userId', { userId })
            .execute();
    }
}