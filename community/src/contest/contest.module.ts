import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  Contest,
  ContestCoOrganizer,
  ContestContestant,
  ContestCriteria,
  ContestCustomerIdentity,
  ContestMarks,
  ContestPrize,
  ContestReaction,
  ContestRules,
  ContestSubmission,
  ContestSubmissionReview,
  ContestTemplates,
} from 'src/database/entities';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';
import { ContestClaimPrize } from 'src/database/entities/contest-claim-prize.entity';
import { ContestOwnCriteriaSubmission } from 'src/database/entities/contest-own-criteria-submissions.entity';
import { ContestOwnCriteria } from 'src/database/entities/contest-own-criteria.entity';
import { ContestSubmissionUpload } from 'src/database/entities/contest-submissions-upload.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contest,
      ContestCoOrganizer,
      ContestCriteria,
      ContestCustomerIdentity,
      ContestMarks,
      ContestPrize,
      ContestRules,
      ContestContestant,
      ContestSubmission,
      ContestSubmissionReview,
      ContestTemplates,
      ContestReaction,
      ContestSubmissionUpload,
      ContestOwnCriteria,
      ContestOwnCriteriaSubmission,
      ContestClaimPrize,
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
  controllers: [ContestController],
  providers: [ContestService, S3Service],
})
export class ContestModule {}
