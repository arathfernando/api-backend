import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  ProjectGig,
  ProjectGigFaq,
  ProjectGigFeedback,
  ProjectGigGallery,
  ProjectGigPackage,
} from 'src/database/entities';
import { ProjectGigFeedbackReaction } from 'src/database/entities/feedback-reaction.entity';
import { ProjectGigCategory } from 'src/database/entities/gig-category.entity';
import { ProjectGigReaction } from 'src/database/entities/gig-reaction.entity';
import { ProjectGigRequestResponse } from 'src/database/entities/gig-request-response.entity';
import { ProjectGigRequest } from 'src/database/entities/gig-request.entity';
import { MarketPlaceController } from './market-place.controller';
import { MarketPlaceService } from './market-place.service';
import { GigPayment } from 'src/database/entities/gig-payment.entity';
import { GigReport } from 'src/database/entities/gig-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectGig,
      ProjectGigFaq,
      ProjectGigGallery,
      ProjectGigPackage,
      ProjectGigFeedback,
      ProjectGigFeedbackReaction,
      ProjectGigCategory,
      ProjectGigRequest,
      ProjectGigRequestResponse,
      ProjectGigReaction,
      GigPayment,
      GigReport,
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
        name: 'PRODUCT_LAUNCHER',
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
  controllers: [MarketPlaceController],
  providers: [MarketPlaceService, S3Service],
})
export class MarketPlaceModule {}
