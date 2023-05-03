import { DataSource, InsertResult } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import 'dotenv/config';
import { Environment } from './enum';

export const DB = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: <number><unknown>process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [__dirname + '/../**/*.entity.js'],
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