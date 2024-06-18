import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/helper/services/s3/s3.service';
import { AdminOptionsController } from './admin-options.controller';
import { AdminOptionsService } from './admin-options.service';
import AdminNotification from 'src/database/entities/admin-notification.entity';
import AdminRole from 'src/database/entities/admin-role.entity';
import Admin from 'src/database/entities/admin.entity';
import Article from 'src/database/entities/article.entity';
import Badge from 'src/database/entities/badge.entity';
import BasicTypeCategory from 'src/database/entities/basic-type-category.entity';
import BasicType from 'src/database/entities/basic-type.entity';
import ContestCategory from 'src/database/entities/contest-category.entity';
import Country from 'src/database/entities/country.entity';
import CourseCategory from 'src/database/entities/course-category.entity';
import Currency from 'src/database/entities/currency.entity';
import DefaultCriteria from 'src/database/entities/default-criteria.entity';
import ExpertiseCategory from 'src/database/entities/expertise-category.entity';
import Goal from 'src/database/entities/goal.entity';
import LanguageLevel from 'src/database/entities/language-level.entity';
import Language from 'src/database/entities/language.entity';
import ModuleType from 'src/database/entities/module-type.entity';
import Nationality from 'src/database/entities/nationality.entity';
import PartnerType from 'src/database/entities/partner-type.entity';
import Prompt from 'src/database/entities/prompt.entity';
import PromptType from 'src/database/entities/prompt_type.entity';
import Social from 'src/database/entities/social.entity';
import Timezone from 'src/database/entities/timezone.entity';
import TranslationLanguages from 'src/database/entities/translation-language.entity';
import TranslationProjectKey from 'src/database/entities/translation-project-key.entity';
import TranslationProjectLanguage from 'src/database/entities/translation-project-language.entity';
import TranslationProjectValue from 'src/database/entities/translation-project-value.entity';
import TranslationProject from 'src/database/entities/translation-project.entity';
import WalkthroughCategory from 'src/database/entities/walkthrough-category.entity';
import WalkthroughStep from 'src/database/entities/walkthrough-step.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      PromptType,
      Prompt,
      BasicTypeCategory,
      BasicType,
      ExpertiseCategory,
      Language,
      LanguageLevel,
      Country,
      Currency,
      Timezone,
      Social,
      Goal,
      Badge,
      TranslationLanguages,
      ContestCategory,
      PartnerType,
      ModuleType,
      CourseCategory,
      AdminRole,
      Article,
      Nationality,
      TranslationProject,
      TranslationProjectKey,
      TranslationProjectValue,
      TranslationProjectLanguage,
      DefaultCriteria,
      AdminNotification,
      WalkthroughStep,
      WalkthroughCategory,
    ]),
    ClientsModule.registerAsync([
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
    ]),
  ],
  providers: [S3Service, AdminOptionsService],
  controllers: [AdminOptionsController],
})
export class AdminOptionsModule {}
