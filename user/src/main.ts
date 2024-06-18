import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import * as compression from 'compression';
import { join } from 'path';

function configureSwagger(app): void {
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('User Service')
    .setDescription('API Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/user/docs', app, document);
}

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.use(helmet());
  app.use(compression());

  // app.use(
  //   rateLimit({
  //     windowMs: 5 * 60 * 1000, // 15 minutes
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
      skipMissingProperties: true,
    }),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`${configService.get('rabbitmq.url')}`],
      queue: `${configService.get('rabbitmq.user_queue')}`,
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.startAllMicroservices();

  app.listen(configService.get('port'), () => {
    logger.log(`🚀 Users service running on port ${configService.get('port')}`);
  });
}
bootstrap();
