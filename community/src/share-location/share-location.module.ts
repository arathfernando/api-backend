import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityService } from 'src/community/community.service';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  Community,
  CommunityEvent,
  CommunityGroup,
  CommunityGroupTimeline,
  CommunityLocationPost,
  CommunityPost,
  CommunityReport,
  CommunityTimeline,
  CommunityTopic,
  CommunityUser,
  GroupActivity,
  GroupUsers,
  LeaveCommunity,
  TopicFollow,
  TopicLike,
} from 'src/database/entities';
import { ShareLocationController } from './share-location.controller';
import { ShareLocationService } from './share-location.service';
import { CommunityRequest } from 'src/database/entities/community-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityLocationPost,
      CommunityTimeline,
      CommunityGroupTimeline,
      GroupActivity,
      Community,
      TopicLike,
      TopicFollow,
      CommunityUser,
      LeaveCommunity,
      CommunityEvent,
      CommunityReport,
      CommunityRequest,
      GroupUsers,
      TopicLike,
      CommunityTopic,
      CommunityGroup,
      CommunityPost,
    ]),
    ClientsModule.registerAsync([
      {
        name: 'ADMIN_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_ADMIN_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_NOTIFICATION_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_USER_QUEUE,
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
  controllers: [ShareLocationController],
  providers: [ShareLocationService, S3Service, CommunityService],
})
export class ShareLocationModule {}
