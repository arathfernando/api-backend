import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

function configureSwagger(app): void {
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Transaction Service')
    .setDescription('API Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/transaction/docs', app, document);
}

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 100, // limit each IP to 100 requests per windowMs
  //   }),
  // );
  app.setGlobalPrefix('/v1/api');

  const configService = app.get<ConfigService>(ConfigService);
  app.enableCors({ origin: '*' });

  configureSwagger(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`${configService.get('rabbitmq.url')}`],
      queue: `${configService.get('rabbitmq.transaction_queue')}`,
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });

  app.startAllMicroservices();
  await app.listen(configService.get('port'));

  logger.log(
    `🚀 Transaction service running on port ${configService.get('port')}`,
  );
}
bootstrap();
