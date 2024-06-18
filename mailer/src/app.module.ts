import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { BullModule } from '@nestjs/bull';
import { TaskProcessor } from './tasks/task.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      name: 'email-sender',
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email-sender',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TaskProcessor],
})
export class AppModule {}
