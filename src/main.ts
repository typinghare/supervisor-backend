import { NestFactory } from '@nestjs/core';
import { SupervisorModule } from './supervisor.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { DB } from './common/database';
import 'dotenv/config';
import { LISTENING_PORT } from './common/constant';

/**
 * Bootstrap function.
 */
async function bootstrap(): Promise<void> {
    // create Nest App (HTTPS)
    const supervisorApp = await NestFactory.create(SupervisorModule);
    supervisorApp.enableCors();
    supervisorApp.setGlobalPrefix('/api');

    // NestJS log
    const logger = new Logger();

    // TypeORM
    try {
        await DB.initialize();
        logger.log('TypeORM module has been initialized.', 'TypeORM');
    } catch (e) {
        console.log(e.message);
        logger.log('Error during TypeORM module initialization.', 'TypeORM');
    }

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Supervisor 2')
        .setDescription('Supervisor 2 Open API documentation.')
        .setVersion('2.1.0')
        .addTag('supervisor')
        .build();
    const document = SwaggerModule.createDocument(supervisorApp, config);
    SwaggerModule.setup('/api/swagger', supervisorApp, document);

    // listen to the port
    await supervisorApp.listen(LISTENING_PORT);
    logger.log(`NestJS is listening on ${LISTENING_PORT} ...`, 'Listening');
}

bootstrap().then();
