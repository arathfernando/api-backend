import { Module } from '@nestjs/common';
import { CourseItemsService } from './course-items.service';
import { CourseItemsController } from './course-items.controller';
import { CourseChapter } from 'src/database/entities/course-chapter.entity';
import { LessonActivity } from 'src/database/entities/lesson-activity.entity';
import {
  CommentLike,
  CourseBasic,
  CourseLesson,
  CoursePayment,
  CourseStructure,
  Instructors,
  LessonActivityComment,
  StudentFileAssignment,
  StudentQuiz,
} from 'src/database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LessonActivityMark } from 'src/database/entities/lesson-activity-mark.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseBasic,
      CourseChapter,
      CourseLesson,
      CoursePayment,
      CourseStructure,
      Instructors,
      LessonActivity,
      LessonActivityComment,
      CommentLike,
      LessonActivityMark,
      StudentQuiz,
      StudentFileAssignment,
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
    ]),
  ],
  providers: [CourseItemsService],
  controllers: [CourseItemsController],
})
export class CourseItemsModule {}
