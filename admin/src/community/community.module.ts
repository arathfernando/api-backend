import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/helper/services/s3/s3.service';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    ClientsModule.registerAsync([
      {
        name: 'COMMUNITY_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_COMMUNITY_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'MAIL_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_MAILER_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'TOKEN_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_TOKEN_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, S3Service],
})
export class CommunityModule {}
