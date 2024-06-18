import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityService } from 'src/community/community.service';
import { S3Service } from 'src/core/services/s3/s3.service';
import { CommunityGroup } from 'src/database/entities/community-group.entity';
import { CommunityGroupController } from './community-group.controller';
import { CommunityGroupService } from './community-group.service';
import {
  CommunityTopic,
  GroupReport,
  GroupUsers,
  LeaveGroup,
  GroupActivity,
  Community,
  TopicLike,
  TopicFollow,
  CommunityUser,
  LeaveCommunity,
  CommunityEvent,
  CommunityReport,
  CommunityPost,
  CommunityTimeline,
} from 'src/database/entities';
import { CommunityRequest } from 'src/database/entities/community-request.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityRequest,
      CommunityGroup,
      CommunityTopic,
      CommunityEvent,
      CommunityReport,
      GroupReport,
      GroupUsers,
      TopicFollow,
      CommunityUser,
      LeaveCommunity,
      LeaveGroup,
      GroupActivity,
      Community,
      TopicLike,
      CommunityPost,
      CommunityTimeline,
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
  controllers: [CommunityGroupController],
  providers: [CommunityGroupService, CommunityService, S3Service],
})
export class CommunityGroupModule {}
