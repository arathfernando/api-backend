import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountSetting,
  CreatorProfile,
  ExpertProfile,
  GeneralProfile,
  HubbersTeamProfile,
  InvestorProfile,
  Partner,
  PartnerContactUs,
  PartnershipContact,
  TeacherProfile,
  User,
} from 'src/database/entities';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';
import { S3Service } from 'src/helper/service/s3/s3.service';
import { AppService } from 'src/app.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Partner,
      PartnershipContact,
      PartnerContactUs,
      GeneralProfile,
      CreatorProfile,
      ExpertProfile,
      InvestorProfile,
      HubbersTeamProfile,
      TeacherProfile,
      AccountSetting,
    ]),
    ClientsModule.registerAsync([
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
    ]),
  ],
  controllers: [PartnerController],
  providers: [
    PartnerService,
    AppService,
    S3Service,
    {
      provide: APP_GUARD,
      useClass: ClientAuthGuard,
    },
  ],
})
export class PartnerModule {}
