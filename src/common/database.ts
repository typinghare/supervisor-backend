import { DataSource, InsertResult } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import 'dotenv/config';
import { Environment } from './enum';
import UserEntity from '../entity/user.entity';
import UserProcessEntity from '../entity/user-process.entity';
import TaskCommentEntity from '../entity/task-comment.entity';
import SubjectEntity from '../entity/subject.entity';
import CategoryEntity from '../entity/category.entity';
import TaskEntity from '../entity/task.entity';

export const DB = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: <number><unknown>process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
        UserEntity,
        UserProcessEntity,
        TaskCommentEntity,
        SubjectEntity,
        CategoryEntity,
        TaskEntity,
    ],
    logging: parseInt(process.env.ENVIRONMENT) in [Environment.DEVELOPMENT, Environment.TEST],
    logger: 'file',
    maxQueryExecutionTime: 1000,
});

/**
 * Get the id of a result.
 * @param insertResult
 */
export function getId(insertResult: InsertResult): number {
    return <number><unknown>insertResult.identifiers[0]['id'];
}