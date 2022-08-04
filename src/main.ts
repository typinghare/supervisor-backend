import { NestFactory } from '@nestjs/core';
import { SupervisorModule } from './supervisor.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { DB } from './common/database';

/**
 * Bootstrap function.
 */
async function bootstrap(): Promise<void> {
  // create Nest App
  const supervisorApp = await NestFactory.create(SupervisorModule);
  supervisorApp.enableCors();

  // NestJS log
  const logger = new Logger();

  // TypeORM
  try {
    await DB.initialize();
    logger.log('TypeORM module has been initialized.', 'TypeORM');
  } catch (e) {
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
  SwaggerModule.setup('supervisor/api', supervisorApp, document);

  // listen
  const listenPort = 3000;
  await supervisorApp.listen(listenPort);
  logger.log(`NestJS is listening on ${listenPort} ...`, 'Listening');
}

bootstrap().then();
