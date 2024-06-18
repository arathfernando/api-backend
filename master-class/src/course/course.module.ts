import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  CourseBasic,
  CourseEnrolled,
  CourseMembers,
  CoursePayment,
  CourseRating,
  CourseReaction,
  CourseReport,
  Instructors,
  ReviewsLike,
  SaveCourse,
  StudentBilling,
} from 'src/database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/core/services/s3/s3.service';
import Stripe from 'stripe';
import { CourseFaq } from 'src/database/entities/course-faq.entity';
import { StudentPayment } from 'src/database/entities/curse-student-payment.entity';
import { InvitedStudent } from 'src/database/entities/invited-student.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseBasic,
      CourseReport,
      CoursePayment,
      Instructors,
      CourseReaction,
      StudentBilling,
      CourseEnrolled,
      CourseFaq,
      SaveCourse,
      StudentPayment,
      CourseMembers,
      CourseRating,
      ReviewsLike,
      InvitedStudent,
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
  providers: [CourseService, S3Service, Stripe],
  controllers: [CourseController],
})
export class CourseModule {}
