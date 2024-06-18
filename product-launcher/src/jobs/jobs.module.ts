import { Module } from '@nestjs/common';
import { JobController } from './jobs.controller';
import { JobService } from './jobs.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  JobBasic,
  JobFiles,
  JobProposal,
  JobProposalBillingSettings,
  JobProposalPayment,
  JobProposalReply,
  JobReaction,
  ProjectBasic,
  UserExpertiseProposalReply,
  UserExpertiseReview,
  UserExpertiseReviewReaction,
} from 'src/database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/core/services/s3/s3.service';
import { UserExpertiseProposal } from 'src/database/entities/user-expertise-proposal.entity';
import { UserExpertiseReport } from 'src/database/entities/user-expertise-report.entity';
import { UserExpertiseReviewReply } from 'src/database/entities/user-expertise-review-reply.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobBasic,
      JobProposal,
      JobReaction,
      UserExpertiseReview,
      UserExpertiseProposal,
      UserExpertiseProposalReply,
      JobProposalReply,
      JobFiles,
      ProjectBasic,
      UserExpertiseReviewReaction,
      JobProposalPayment,
      UserExpertiseReviewReply,
      JobProposalBillingSettings,
      UserExpertiseReport,
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
        name: 'TRANSACTION_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_TRANSACTION_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [JobService, S3Service],
  controllers: [JobController],
})
export class JobModule {}
