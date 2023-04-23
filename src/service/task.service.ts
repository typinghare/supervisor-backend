import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import TaskVo from '../vo/task.vo';
import TaskEntity from '../entity/task.entity';
import TaskDto from '../dto/task.dto';
import { DB, getId } from '../common/database';
import UserService from './user.service';
import { Action, Stage } from '../common/enum';
import TaskCommentEntity from '../entity/task-comment.entity';
import TaskCommentDto from '../dto/task-comment.dto';
import TaskCommentVo from '../vo/task-comment.vo';
import * as moment from 'moment';
import * as _ from 'lodash';
import { DATE_FORMAT } from '../common/constant';
import { getDate, getDifferentMinutes } from '../common/helper';

@Injectable()
export default class TaskService {
    public constructor(
        /**
         * @see https://docs.nestjs.com/fundamentals/circular-dependency#circular-dependency
         * To solve the circular dependency problem, we have to use the forward referencing technique.
         */
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
    ) {
    }

    /**
     * Fetch a task by a specified id.
     * @param taskId
     */
    public async fetchTaskById(taskId: number): Promise<TaskEntity | null> {
        const task = await DB.getRepository(TaskEntity)
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.category', 'category')
            .leftJoinAndSelect('category.subject', 'subject')
            .leftJoinAndSelect('task.taskCommentList', 'taskCommentList')
            .where('task.id = :taskId', { taskId })
            .andWhere('task.deleted_at IS NULL')
            .getOne();

        if (!task) return null;

        if (parseInt(<string><unknown>task.stage) == Stage.ONGOING && task.lastResumeAt) {
            task.duration += getDifferentMinutes(task.lastResumeAt);
        }

        return task;
    }

    /**
     * Convert task entity to task vo.
     * @param task
     */
    public getTaskVo(task: TaskEntity): TaskVo {
        const commentList: TaskCommentVo[] = task.taskCommentList.map(comment => {
            return this.getTaskCommentVo(comment);
        });

        return {
            categoryId: task.category.id,
            categoryName: task.category.name,
            createdAt: task.createdAt,
            duration: task.duration,
            endedAt: task.endedAt,
            expectedDuration: task.category.expectedDuration,
            id: task.id,
            lastResumeAt: task.lastResumeAt,
            stage: task.stage,
            startedAt: task.startedAt,
            subjectName: task.category.subject.name,
            commentList: commentList,
        };
    }

    /**
     * Create a task.
     * @param taskDto
     */
    public async createTask(taskDto: TaskDto): Promise<TaskVo> {
        const userId = this.userService.getUserId();

        const insertResult = await DB.createQueryBuilder()
            .insert()
            .into(TaskEntity)
            .values({
                userId: userId,
                categoryId: taskDto.categoryId,
                createdAt: new Date(),
            })
            .execute();

        if (!insertResult) throw new HttpException('Insertion result is missing.', HttpStatus.INTERNAL_SERVER_ERROR);

        // automatically switch to this task if no selected task or the stage of selected class is ENDED
        const selectedTask = await this.userService.getSelectedTask(userId);
        if (selectedTask === null || selectedTask.stage == Stage.ENDED) {
            await this.userService.switchTask({ taskId: getId(insertResult) });
        }

        return this.getTaskVo(await this.fetchTaskById(getId(insertResult)));
    }

    /**
     * Fetch tasks.
     * @param taskDto
     */
    public async fetchTaskPaged(taskDto: TaskDto): Promise<TaskVo[]> {
        const where: Partial<TaskEntity> = _.omitBy({
            userId: taskDto.userId,
            stage: taskDto.stage,
        }, _.isUndefined);

        let startDateTime, endDateTime;

        if (getDate(taskDto.selectedDate) === new Date()) {
            // it is today
            startDateTime = moment().subtract(24, 'hours').toDate();
            endDateTime = moment().toDate();
        } else {
            startDateTime = moment(taskDto.selectedDate, DATE_FORMAT).startOf('day').toDate();
            endDateTime = moment(taskDto.selectedDate, DATE_FORMAT).endOf('day').toDate();
        }

        const tasks = await DB.getRepository(TaskEntity)
            .createQueryBuilder('task')
            .where(where)
            .leftJoinAndSelect('task.category', 'category')
            .leftJoinAndSelect('category.subject', 'subject')
            .leftJoinAndSelect('task.taskCommentList', 'taskCommentList')
            .where(_.omitBy({
                userId: taskDto.userId,
                stage: taskDto.stage,
            }, _.isUndefined))
            .andWhere('task.created_at BETWEEN :startDateTime AND :endDateTime', { startDateTime, endDateTime })
            .andWhere('task.deleted_at IS NULL')
            .orderBy('task.id')
            .getMany();

        tasks.forEach((task: TaskEntity) => {
            if (parseInt(<string><unknown>task.stage) == Stage.ONGOING) {
                if (task.lastResumeAt) {
                    task.duration += getDifferentMinutes(task.lastResumeAt);
                }
            }
        });

        // make selected task (if exists) at the beginning of the list
        const selectedTask = await this.userService.getSelectedTask(taskDto.userId);
        if (selectedTask !== null) {
            const selectedTaskId = selectedTask.id;
            const index = _.findIndex(tasks, (task) => task.id == selectedTaskId);
            if (index >= 0) {
                tasks.unshift(tasks[index]);
                for (let i = index + 1; i < tasks.length; i++) {
                    tasks[i] = tasks[i + 1];
                }
                tasks.pop();
            }
        }

        return tasks.map(task => this.getTaskVo(task));
    }

    /**
     * Update the stage of a task.
     * @param taskId
     * @param action
     */
    public async updateTaskStage(taskId: number, action: Action): Promise<TaskVo> {
        const task = await this.fetchTaskById(taskId);
        if (!task) {
            throw new HttpException('The task is not found.', HttpStatus.NOT_FOUND);
        }

        if (task.userId != this.userService.getUserId()) {
            throw new HttpException('You cannot update a task which is not yours.', HttpStatus.FORBIDDEN);
        }

        // get the new stage by action
        const oldStage = parseInt(<string><unknown>task.stage);
        const newStage = this.switchStage(task.stage, action);
        if (newStage === null) {
            throw new HttpException('You cannot update the stage of the task with this specified action.', HttpStatus.FORBIDDEN);
        }

        // update stage
        // the duration difference has been counted by <fetchTaskById> function
        const updateValues: Partial<TaskEntity> = { stage: newStage };
        switch (newStage) {
            case Stage.ONGOING:
                if (oldStage == Stage.PENDING) {
                    updateValues.startedAt = new Date();
                }
                updateValues.lastResumeAt = new Date();
                break;
            case Stage.PAUSED:
                updateValues.lastResumeAt = null;
                updateValues.duration = task.duration;
                break;
            case Stage.ENDED:
                updateValues.lastResumeAt = null;
                updateValues.endedAt = new Date();
                updateValues.duration = task.duration;
                break;
        }

        const updateResult = await DB.createQueryBuilder()
            .update(TaskEntity)
            .set(updateValues)
            .where({ id: taskId })
            .execute();

        if (updateResult.affected) {
            Object.assign(task, updateValues);
            return this.getTaskVo(task);
        } else {
            throw new Error('Fail to update stage');
        }
    }

    /**
     * Switch stage.
     * @param currentStage
     * @param action
     */
    public switchStage(currentStage: number, action: number): Stage | null {
        switch (action) {
            case Action.START:
                return currentStage == Stage.PENDING ? Stage.ONGOING : null;
            case Action.PAUSE:
                return currentStage == Stage.ONGOING ? Stage.PAUSED : null;
            case Action.RESUME:
                return currentStage == Stage.PAUSED ? Stage.ONGOING : null;
            case Action.FINISH:
                return currentStage == Stage.ONGOING || currentStage == Stage.PAUSED ? Stage.ENDED : null;
            default:
                return null;
        }
    }

    /**
     * Remove a specified task.
     * @param taskId
     */
    public async removeTask(taskId: number) {
        const task = await this.fetchTaskById(taskId);
        if (!task) {
            throw new HttpException('The task is not found.', HttpStatus.NOT_FOUND);
        }

        if (task.userId != this.userService.getUserId()) {
            throw new HttpException('You cannot remove a task which is not yours.', HttpStatus.FORBIDDEN);
        }

        await DB.createQueryBuilder()
            .update(TaskEntity)
            .set({ deletedAt: new Date() })
            .where({ id: taskId })
            .execute();

        // remove selected task
        await this.userService.removeSelectedTask();
    }

    /**
     * User posts a comment to a task.
     * @param taskCommentDto
     */
    public async postComment(taskCommentDto: TaskCommentDto): Promise<TaskCommentVo> {
        const task = await this.fetchTaskById(taskCommentDto.taskId);
        if (!task) {
            throw new HttpException('The task is not found.', HttpStatus.NOT_FOUND);
        }

        if (task.userId != this.userService.getUserId()) {
            throw new HttpException('You cannot update a task which is not yours.', HttpStatus.FORBIDDEN);
        }

        const result = await DB.createQueryBuilder()
            .insert()
            .into(TaskCommentEntity)
            .values({ ...taskCommentDto, createdAt: new Date(), updatedAt: new Date() })
            .execute();

        return await this.fetchComment(getId(result));
    }

    /**
     * Fetch comments.
     * @param taskId
     */
    public async fetchComments(taskId: number): Promise<TaskCommentVo[]> {
        const taskComments = await DB.getRepository(TaskCommentEntity)
            .createQueryBuilder('taskComment')
            .where({ taskId })
            .getMany();

        return taskComments.map(this.getTaskCommentVo);
    }

    /**
     * Fetch a comment.
     * @param commentId
     */
    public async fetchComment(commentId: number): Promise<TaskCommentEntity> {
        return await DB.getRepository(TaskCommentEntity)
            .createQueryBuilder('taskComment')
            .leftJoinAndSelect('taskComment.task', 'task')
            .where('taskComment.id = :commentId', { commentId })
            .getOne();
    }

    /**
     * Convert task comment entity to comment entity vo.
     * @param taskCommentEntity
     */
    public getTaskCommentVo(taskCommentEntity: TaskCommentEntity): TaskCommentVo {
        return {
            isPinned: taskCommentEntity.isPinned,
            createdAt: taskCommentEntity.createdAt,
            id: taskCommentEntity.id,
            content: taskCommentEntity.content,
            updatedAt: taskCommentEntity.updatedAt,
        };
    }

    /**
     * Update a comment.
     * @param commentId
     * @param taskCommentDto
     */
    public async updateComment(commentId: number, taskCommentDto: TaskCommentDto): Promise<any> {
        if ('isPinned' in taskCommentDto) {
            // Unpinned a comment is now not available
            return await this.pinComment(commentId);
        }

        if ('content' in taskCommentDto) {
            return await this.editComment(commentId, taskCommentDto.content);
        }
    }

    /**
     * Pin a comment.
     * @param commentId
     */
    public async pinComment(commentId: number): Promise<{ formerPinnedCommentId: number, comment: TaskCommentVo }> {
        const comment = await this.fetchComment(commentId);

        if (!comment) {
            throw new HttpException('Comment not exists.', HttpStatus.NOT_FOUND);
        }

        if (comment.task.userId != this.userService.getUserId()) {
            throw new HttpException('You cannot pin a comment that is not yours.', HttpStatus.FORBIDDEN);
        }

        // unpinned the comment which is already pinned
        const pinnedComment = await DB.getRepository(TaskCommentEntity)
            .createQueryBuilder()
            .where({
                taskId: comment.taskId,
                isPinned: true,
            })
            .getOne();

        if (pinnedComment) {
            await DB.createQueryBuilder()
                .update(TaskCommentEntity)
                .set({ isPinned: false })
                .where({ id: pinnedComment.id })
                .execute();
        }

        // pinned the specified comment
        await DB.createQueryBuilder()
            .update(TaskCommentEntity)
            .set({ isPinned: true })
            .where({ id: commentId })
            .execute();

        comment.isPinned = true;
        return {
            formerPinnedCommentId: pinnedComment.id,
            comment: this.getTaskCommentVo(comment),
        };
    }

    /**
     * edit a comment.
     * @param commentId
     * @param content
     */
    public async editComment(commentId: number, content: string): Promise<TaskCommentVo> {
        const comment = await this.fetchComment(commentId);

        if (!comment) {
            throw new HttpException('Comment not exists.', HttpStatus.NOT_FOUND);
        }

        if (comment.task.userId != this.userService.getUserId()) {
            throw new HttpException('You cannot remove a comment that is not yours.', HttpStatus.FORBIDDEN);
        }

        await DB.createQueryBuilder()
            .update(TaskCommentEntity)
            .set({ content })
            .where({ id: commentId })
            .execute();

        comment.content = content;

        return this.getTaskCommentVo(comment);
    }

    /**
     * Remove a comment.
     * @param commentId
     */
    public async removeComment(commentId: number): Promise<void> {
        const comment = await this.fetchComment(commentId);

        if (!comment) {
            throw new HttpException('Comment not exists.', HttpStatus.NOT_FOUND);
        }

        if (comment.task.userId != this.userService.getUserId()) {
            throw new HttpException('You cannot remove a comment that is not yours.', HttpStatus.FORBIDDEN);
        }

        await DB.createQueryBuilder()
            .update(TaskCommentEntity)
            .set({ deletedAt: new Date() })
            .where({ id: commentId })
            .execute();
    }
}