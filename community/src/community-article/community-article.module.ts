import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityService } from 'src/community/community.service';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  Community,
  CommunityArticle,
  CommunityEvent,
  CommunityGroup,
  CommunityGroupTimeline,
  CommunityPost,
  CommunityReport,
  CommunityTimeline,
  CommunityTopic,
  CommunityUser,
  GroupUsers,
  LeaveCommunity,
  TopicFollow,
  TopicLike,
} from 'src/database/entities';
import { CommunityArticleController } from './community-article.controller';
import { CommunityArticleService } from './community-article.service';
import { CommunityRequest } from 'src/database/entities/community-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityArticle,
      Community,
      CommunityTimeline,
      CommunityGroupTimeline,
      CommunityGroup,
      CommunityTopic,
      TopicLike,
      TopicFollow,
      CommunityUser,
      LeaveCommunity,
      CommunityEvent,
      CommunityReport,
      CommunityRequest,
      GroupUsers,
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
  controllers: [CommunityArticleController],
  providers: [CommunityArticleService, S3Service, CommunityService],
})
export class CommunityArticleModule {}
