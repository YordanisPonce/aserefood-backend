import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import AdminSeederService from './users/seeders/admin-seeder.service';
import * as basicAuth from "express-basic-auth";

async function bootstrap() {
  const logger = new Logger('AppBootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  const port = config.get<number>('APP_PORT');

  const swaggerPassword = app.get(ConfigService).get('SWAGGER_PASSWORD');
  const nodeEnv = app.get(ConfigService).get('NODE_ENV');
  if (nodeEnv !== 'development') {
    app.use(
      ['/swagger', '/swagger-json'],
      basicAuth({
        challenge: true,
        users: {
          admin: swaggerPassword,
        },
      }),
    );
  }

  const options = new DocumentBuilder()
    .setTitle('Asere Food API')
    .setDescription('### API for Asere Food System.')
    .setLicense('UNLICENSED', 'https://unlicense.org/')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, options);

  const paths = Object.keys(doc.paths).sort();
  const sortedPaths = {};
  paths.forEach((path) => {
    sortedPaths[path] = doc.paths[path];
  });
  doc.paths = sortedPaths;

  const schemas = Object.keys(doc.components.schemas).sort();
  const sortedSchemas = {};
  schemas.forEach((schema) => {
    sortedSchemas[schema] = doc.components.schemas[schema];
  });
  doc.components.schemas = sortedSchemas;

  SwaggerModule.setup('/swagger', app, doc);

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: true,
    }),
  );
  app.use(helmet());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(port);

  const userSeederService = app.get(AdminSeederService);
  await userSeederService.createAdminUser();

  logger.log('Listening in port ' + port);

  const address = app.getHttpServer().address();
  const host = address.address === '::' ? 'localhost' : address.address;
  const appUrl = `http://${host}:${address.port}`;
  logger.log(`Swagger is available on: ${appUrl}/swagger`);
}

bootstrap();
