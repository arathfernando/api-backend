import { Module } from '@nestjs/common';
import {
  CourseLesson,
  LessonActivity,
  StudentFileAssignment,
  StudentQuiz,
  TeacherQuiz,
} from 'src/database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CourseQuizService } from './course-quiz.service';
import { CourseQuizController } from './course-quiz.controller';
import { TeacherFileAssignment } from 'src/database/entities/teacher-file-assignment.entity';
import { StudentFileAssignmentFeedback } from 'src/database/entities/student-file-assignment-feedback.entity';
import { StudentFileAssignmentGrade } from 'src/database/entities/student-file-assignment-grade.entity';
import { TeacherQuizQuestion } from 'src/database/entities/quiz-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentQuiz,
      CourseLesson,
      TeacherQuiz,
      TeacherFileAssignment,
      StudentFileAssignment,
      LessonActivity,
      StudentFileAssignmentGrade,
      StudentFileAssignmentFeedback,
      TeacherQuizQuestion,
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
  providers: [CourseQuizService],
  controllers: [CourseQuizController],
})
export class CourseQuizModule {}
