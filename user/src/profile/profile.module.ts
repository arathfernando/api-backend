import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppService } from 'src/app.service';
import { S3Service } from 'src/helper/service/s3/s3.service';
import { GeneralController } from './general/general.controller';
import { GeneralService } from './general/general.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { CreatorController } from './creator/creator.controller';
import { CreatorService } from './creator/creator.service';
import { ExpertService } from './expert/expert.service';
import { ExpertController } from './expert/expert.controller';
import { InvestorController } from './investor/investor.controller';
import { InvestorService } from './investor/investor.service';
import { HubbersTeamController } from './hubbers-team/hubbers-team.controller';
import { HubbersTeamService } from './hubbers-team/hubbers-team.service';
import { TeacherController } from './teacher/teacher.controller';
import { TeacherService } from './teacher/teacher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountSetting,
  CreatorProfile,
  Education,
  ExpertProfile,
  ExpertProfileReaction,
  GeneralProfile,
  HubbersTeamProfile,
  InvestorProfile,
  InviteInvestor,
  ProfileBadge,
  ProfileGoal,
  SocialMedia,
  TeacherProfile,
  User,
  UserInterest,
  UserPortfolio,
  WorkExperience,
} from 'src/database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      GeneralProfile,
      CreatorProfile,
      ExpertProfile,
      InvestorProfile,
      TeacherProfile,
      HubbersTeamProfile,
      AccountSetting,
      WorkExperience,
      Education,
      SocialMedia,
      UserInterest,
      ProfileGoal,
      ProfileBadge,
      UserPortfolio,
      ExpertProfileReaction,
      InviteInvestor,
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
  controllers: [
    GeneralController,
    ProfileController,
    CreatorController,
    ExpertController,
    InvestorController,
    TeacherController,
    HubbersTeamController,
  ],
  providers: [
    AppService,
    S3Service,
    GeneralService,
    ProfileService,
    CreatorService,
    ExpertService,
    InvestorService,
    HubbersTeamService,
    TeacherService,
  ],
})
export class ProfileModule {}
