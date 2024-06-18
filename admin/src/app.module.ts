import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AdminOptionsModule } from './admin-options/admin-options.module';
import * as path from 'path';
import { AllExceptionsFilter } from './helper/interceptor/exception.interceptor';
import { S3Service } from './helper/services/s3/s3.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Connection } from 'typeorm';
import { ClientAuthGuard } from './helper/guards/auth.guard';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { CommunityModule } from './community/community.module';
import { CommunityMembersModule } from './community-members/community-members.module';
import { CommunityTopicsModule } from './community-topics/community-topics.module';
import { CommunityGroupModule } from './community-group/community-group.module';
import { CommunityEventModule } from './community-event/community-event.module';
import { ContentModule } from './contest/contest.module';
import { InvestorModule } from './investor/investor.module';
import { CourseModule } from './course/course.module';
import { ProductLauncherModule } from './product-launcher/product-launcher.module';
import { MarketPlaceModule } from './market-place/market-place.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { JobModule } from './jobs/jobs.module';
import Admin from './database/entities/admin.entity';
import AdminRole from './database/entities/admin-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, AdminRole]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: ['dist/**/*.entity.{ts,js}'],
        migrations: ['dist/migrations/*.{ts,js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    AdminOptionsModule,
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
        name: 'MARKET_PLACE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_MARKET_PLACE_QUEUE,
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
    ]),
    AdminModule,
    UserModule,
    CommunityModule,
    CommunityMembersModule,
    CommunityTopicsModule,
    CommunityGroupModule,
    CommunityEventModule,
    ContentModule,
    InvestorModule,
    CourseModule,
    ProductLauncherModule,
    MarketPlaceModule,
    WorkspaceModule,
    JobModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    S3Service,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ClientAuthGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
