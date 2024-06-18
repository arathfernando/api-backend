import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityService } from 'src/community/community.service';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  CommunityLocationPost,
  CommunityPost,
  CommunityPoll,
  CommunityArticle,
  Community,
  CommunityEvent,
  CommunityTimeline,
  CommunityTopic,
  CommunityUser,
  EventAttendees,
  PostLike,
  TopicLike,
  TopicFollow,
  LeaveCommunity,
  CommunityReport,
  CommunityGroup,
  GroupUsers,
  CommunityPollAnswers,
  PostHide,
} from 'src/database/entities';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { PostCommentLike } from 'src/database/entities/post-comment-like.entity';
import { CommunityRequest } from 'src/database/entities/community-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityArticle,
      CommunityEvent,
      CommunityLocationPost,
      CommunityPoll,
      CommunityPost,
      CommunityTimeline,
      CommunityTopic,
      CommunityUser,
      EventAttendees,
      PostLike,
      PostCommentLike,
      CommunityRequest,
      TopicLike,
      TopicFollow,
      LeaveCommunity,
      CommunityReport,
      CommunityGroup,
      GroupUsers,
      CommunityPollAnswers,
      PostHide,
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
        name: 'MASTER_CLASS',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_MASTERCLASS_QUEUE,
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
      {
        name: 'PRODUCT_LAUNCHER_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_PRODUCT_LAUNCHER_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
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
    ]),
  ],
  controllers: [TimelineController],
  providers: [TimelineService, CommunityService, S3Service],
})
export class TimelineModule {}
