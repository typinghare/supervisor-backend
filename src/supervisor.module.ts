import { Module } from '@nestjs/common';
import SubjectController from './controller/subject.controller';
import UserService from './service/user.service';
import SubjectService from './service/subject.service';
import TaskService from './service/task.service';
import CategoryService from './service/category.service';
import UserController from './controller/user.controller';
import CategoryController from './controller/category.controller';
import TaskController from './controller/task.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import ResponseInterceptor from './common/response.interceptor';
import TokenInterceptor from './common/token.interceptor';
import TaskCommentController from './controller/task-comment.controller';
import StatisticsController from './controller/statistics.controller';
import StatisticsService from './service/statistics.service';

@Module({
    imports: [],
    controllers: [
        UserController,
        SubjectController,
        CategoryController,
        TaskController,
        TaskCommentController,
        StatisticsController,
    ],
    providers: [
        UserService,
        SubjectService,
        CategoryService,
        TaskService,
        StatisticsService,
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TokenInterceptor,
        },
    ],
})
export class SupervisorModule {
}
