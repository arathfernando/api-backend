import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityService } from 'src/community/community.service';
import { S3Service } from 'src/core/services/s3/s3.service';
import { CommunityPost } from 'src/database/entities/posts.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import {
  Comments,
  Community,
  CommunityArticle,
  CommunityEvent,
  CommunityGroup,
  CommunityGroupTimeline,
  CommunityLocationPost,
  CommunityPoll,
  CommunityReport,
  CommunityTimeline,
  CommunityTopic,
  CommunityUser,
  EventAttendees,
  GroupActivity,
  GroupPostCommentHide,
  GroupPostComments,
  GroupPostHide,
  GroupUsers,
  LeaveCommunity,
  PostCommentHide,
  PostCommentReport,
  PostHide,
  PostPin,
  PostReport,
  TopicFollow,
  TopicLike,
} from 'src/database/entities';
import { PostCommentLike } from 'src/database/entities/post-comment-like.entity';
import { GroupPostCommentLike } from 'src/database/entities/post-group-comment-like.entity';
import { SharedPosts } from 'src/database/entities/share-post.entity';
import { CommunityRequest } from 'src/database/entities/community-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityArticle,
      CommunityGroup,
      CommunityGroupTimeline,
      CommunityLocationPost,
      CommunityPoll,
      CommunityTimeline,
      CommunityTopic,
      GroupActivity,
      PostPin,
      PostCommentReport,
      PostCommentHide,
      GroupPostComments,
      GroupPostCommentHide,
      GroupPostHide,
      PostHide,
      Comments,
      GroupPostComments,
      CommunityPost,
      PostReport,
      SharedPosts,
      PostCommentLike,
      GroupPostCommentLike,
      TopicLike,
      TopicFollow,
      CommunityUser,
      LeaveCommunity,
      CommunityEvent,
      CommunityReport,
      CommunityRequest,
      GroupUsers,
      TopicLike,
      EventAttendees,
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
  controllers: [PostsController],
  providers: [PostsService, CommunityService, S3Service],
})
export class PostsModule {}
