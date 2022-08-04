import { DataSource, InsertResult } from 'typeorm';
import SubjectEntity from '../entity/subject.entity';
import UserEntity from '../entity/user.entity';
import CategoryEntity from '../entity/category.entity';
import TaskEntity from '../entity/task.entity';
import TaskCommentEntity from '../entity/task-comment.entity';
import UserProcessEntity from '../entity/user-process.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import 'dotenv/config';
import { Environment } from './enum';

export const DB = new DataSource({
  type: <'mysql'>process.env.DATABASE_TYPE,
  host: process.env.DATABASE_HOST,
  port: <number><unknown>process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    UserEntity,
    SubjectEntity,
    CategoryEntity,
    TaskEntity,
    TaskCommentEntity,
    UserProcessEntity,
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