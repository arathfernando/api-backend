import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CourseLesson,
  LessonActivity,
  StudentFileAssignment,
  StudentQuiz,
  TeacherQuiz,
} from 'src/database/entities';
import { Between, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentQuizDto } from 'src/core/dtos/course/student-quiz.dto';
import { ClientProxy } from '@nestjs/microservices';
import { TeacherFileAssignment } from 'src/database/entities/teacher-file-assignment.entity';
import { CreateTeacherAssignmentDto } from 'src/core/dtos/course/teacher-file-assignment.dto';
import { CreateStudentAssignmentDto } from 'src/core/dtos/course/student-file-assignment.dto';
import { firstValueFrom } from 'rxjs';
import { CreateStudentAssignmentFeedbackDto } from 'src/core/dtos/course/student-file-assignment-feedback.dto';
import { StudentFileAssignmentFeedback } from 'src/database/entities/student-file-assignment-feedback.entity';
import { CreateStudentAssignmentGradeDto } from 'src/core/dtos/course/student-file-assignment-grade.dto';
import { StudentFileAssignmentGrade } from 'src/database/entities/student-file-assignment-grade.entity';
import { QuizAllProcessDto } from 'src/core/dtos/course/teacher-quiz-all-process-dto';
import { CreateQuizDto } from 'src/core/dtos/course/create-quiz.dto';
import { TeacherQuizQuestion } from 'src/database/entities/quiz-question.entity';
import { ScoreDto } from 'src/core/dtos/get-score.dto';
import { fileAssignmentGetDto } from 'src/core/dtos/get-file-assignment.dto';


@Injectable()
export class CourseQuizService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @InjectRepository(TeacherQuiz)
    private readonly teacherQuizRepository: Repository<TeacherQuiz>,
    @InjectRepository(StudentQuiz)
    private readonly studentQuizRepository: Repository<StudentQuiz>,
    @InjectRepository(CourseLesson)
    private readonly courseLessonRepository: Repository<CourseLesson>,
    @InjectRepository(TeacherFileAssignment)
    private readonly teacherFileAssignmentRepository: Repository<TeacherFileAssignment>,
    @InjectRepository(StudentFileAssignment)
    private readonly studentFileAssignmentRepository: Repository<StudentFileAssignment>,
    @InjectRepository(LessonActivity)
    private readonly lessonActivityRepository: Repository<LessonActivity>,
    @InjectRepository(StudentFileAssignmentFeedback)
    private readonly studentFileAssignmentFeedbackRepository: Repository<StudentFileAssignmentFeedback>,
    @InjectRepository(StudentFileAssignmentGrade)
    private readonly studentFileAssignmentGradeRepository: Repository<StudentFileAssignmentGrade>,
    @InjectRepository(TeacherQuizQuestion)
    private readonly teacherQuizQuestionRepository: Repository<TeacherQuizQuestion>,
  ) {}

  public async getUser(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_id', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  public async createTeacherQuiz(
    data: CreateQuizDto[],
    user_id: number,
  ): Promise<any> {
    try {
      const quizResp: any = [];
      for (let i = 0; i < data.length; i++) {
        const courseLesson = await this.courseLessonRepository.findOne({
          where: {
            id: data[i].course_lesson_id,
          },
        });

        if (!courseLesson) {
          return {
            status: 500,
            message: 'No Course Lesson Found.',
          };
        }

        const lessonActivity = await this.lessonActivityRepository.findOne({
          where: {
            id: data[i].lesson_activity_id,
          },
        });

        if (!lessonActivity) {
          return {
            status: 500,
            message: 'No Lesson Activity Found.',
          };
        }
        const quiz = new TeacherQuiz();
        quiz.created_by = user_id;
        quiz.course_lesson = courseLesson;
        quiz.lesson_activity = lessonActivity;
        await this.teacherQuizRepository.save(quiz);
        quizResp.push(quiz);

        const quizQuestion = new TeacherQuizQuestion();
        quizQuestion.created_by = user_id;
        quizQuestion.options = data[i].options;
        quizQuestion.answers = data[i].answers;
        quizQuestion.question_type = data[i].question_type;
        quizQuestion.question_description = data[i].question_description;
        quizQuestion.question_name = data[i].question_name;
        quizQuestion.teacher_quiz = quiz;
        await this.teacherQuizQuestionRepository.save(quizQuestion);
        quizResp.push(quizQuestion);
      }

      return quizResp;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateTeacherQuiz(data: any, user_id: number): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const teacherQuiz = await this.teacherQuizRepository.findOne({
          where: {
            id: data[i].id,
            created_by: user_id,
          },
        });
        if (!teacherQuiz) {
          return {
            status: 500,
            message: 'No Teacher Quiz Found.',
          };
        }

        const courseLesson = await this.courseLessonRepository.findOne({
          where: {
            id: data[i].course_lesson_id,
          },
        });
        if (!courseLesson) {
          return {
            status: 500,
            message: 'No Course Lesson Found.',
          };
        }
        delete data[i].course_lesson_id;
        data[i].course_lesson = courseLesson;

        const lessonActivity = await this.lessonActivityRepository.findOne({
          where: {
            id: data[i].lesson_activity_id,
          },
        });

        if (!lessonActivity) {
          return {
            status: 500,
            message: 'No Lesson Activity Found.',
          };
        }
        delete data[i].lesson_activity_id;
        data[i].lesson_activity = lessonActivity;
        await this.teacherQuizRepository.update(data[i].id, data[i]);
      }
      const ids = await this.arrayColumn(data, 'id');
      const responseData = await this.teacherQuizRepository.find({
        where: {
          id: In(ids),
        },
      });
      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async quizAllProcess(
    data: QuizAllProcessDto,
    user_id: number,
  ): Promise<any> {
    try {
      const responseReturn = {
        create_quiz: [],
        update_quiz: [],
      };
      if (data.create_quiz && data.create_quiz.length) {
        const response = await this.createTeacherQuiz(
          data.create_quiz,
          user_id,
        );
        if (response.status === 500) {
          return response;
        }
        responseReturn.create_quiz.push(response);
      }
      if (data.update_quiz && data.update_quiz.length) {
        const response = await this.updateTeacherQuiz(
          data.update_quiz,
          user_id,
        );
        if (response.status === 500) {
          return response;
        }
        responseReturn.update_quiz.push(response);
      }
      if (data.delete_quiz) {
        for (let i = 0; i < data.delete_quiz.length; i++) {
          const response = await this.deleteTeacherQuiz(
            data.delete_quiz[i],
            user_id,
          );
          if (response.status === 500) {
            return response;
          }
        }
      }

      return responseReturn;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTeacherQuizById(id: number): Promise<any> {
    try {
      const teacherQuiz = await this.teacherQuizRepository.findOne({
        where: {
          id: id,
        },
        relations: ['course_lesson'],
      });

      if (!teacherQuiz) {
        throw new HttpException(
          'TEACHER_QUIZ_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return teacherQuiz;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteTeacherQuiz(id: number, user_id: number): Promise<any> {
    try {
      console.log('id', id);

      const teacherQuiz = await this.teacherQuizRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });

      if (!teacherQuiz) {
        return {
          status: 500,
          message: 'No Teacher Quiz Found.',
        };
      }
      await this.teacherQuizRepository.delete(id);

      return {
        status: 200,
        message: `Teacher Quiz Deleted successfully.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTeacherQuiz(data: any, user_id: number): Promise<any> {
    try {
      const where =
        user_id == 0
          ? {}
          : {
              created_by: user_id,
            };
      const teacherQuiz = await this.teacherQuizRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
        where: where,
        relations: [
          'course_lesson',
          'student_quiz',
          'teacher_quiz_comment',
          'teacher_quiz_comment.teacher_quiz_comment_like',
        ],
      });
      if (!teacherQuiz.length) {
        return {
          status: 500,
          message: 'TEACHER_QUIZ_NOT_FOUND',
        };
      }
      return teacherQuiz;
    } catch (error) {}
  }

  public async createStudentQuiz(
    data: StudentQuizDto,
    user_id: number,
  ): Promise<any> {
    try {
      const teacherQuizQuestion =
        await this.teacherQuizQuestionRepository.findOne({
          where: {
            id: data.question_id,
          },
          relations: ['teacher_quiz'],
        });

      if (!teacherQuizQuestion) {
        return {
          status: 500,
          message: 'Teacher quiz question not found.',
        };
      }
      const teacherQuiz = await this.teacherQuizRepository.findOne({
        where: {
          id: teacherQuizQuestion.teacher_quiz.id,
        },
      });

      if (!teacherQuiz) {
        return {
          status: 500,
          message: 'Teacher quiz not found.',
        };
      }

      const student_quiz = new StudentQuiz();
      student_quiz.created_by = user_id;
      student_quiz.teacher_quiz = teacherQuiz;
      student_quiz.quiz_question = teacherQuizQuestion;
      student_quiz.answers = data.answers;
      await this.studentQuizRepository.save(student_quiz);
      return student_quiz;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateStudentQuiz(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const studentQuiz = await this.studentQuizRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });

      if (!studentQuiz) {
        throw new HttpException(
          'STUDENT_QUIZ_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const teacherQuizQuestion =
        await this.teacherQuizQuestionRepository.findOne({
          where: {
            id: data.question_id,
          },
          relations: ['teacher_quiz'],
        });

      if (!teacherQuizQuestion) {
        return {
          status: 500,
          message: 'Teacher quiz question not found.',
        };
      }

      const teacherQuiz = await this.teacherQuizRepository.findOne({
        where: {
          id: teacherQuizQuestion.teacher_quiz.id,
        },
      });
      if (!teacherQuiz) {
        return {
          status: 500,
          message: 'No teacher quiz found.',
        };
      }

      delete data.teacher_quiz_id;
      data.teacher_quiz = teacherQuiz;
      delete data.question_id;
      data.quiz_question = teacherQuizQuestion;
      await this.studentQuizRepository.update(id, data);

      return {
        status: 200,
        message: 'Student Quiz updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentQuizByTeacherQuizId(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const studentQuiz = await this.studentQuizRepository.find({
        where: {
          teacher_quiz: {
            id: id,
          },
          created_by: user_id,
        },
        relations: [
          'teacher_quiz',
          'teacher_quiz.student_quiz',
          'teacher_quiz.quiz_question',
        ],
      });

      if (!studentQuiz && studentQuiz.length <= 0) {
        throw new HttpException(
          'STUDENT_QUIZ_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return studentQuiz;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentQuizByCourseLessonId(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const teacherQuiz = await this.teacherQuizRepository.find({
        where: {
          course_lesson: {
            id: id,
          },
          created_by: user_id,
        },
        relations: ['course_lesson', 'teacher_quiz'],
      });

      if (!teacherQuiz && teacherQuiz.length <= 0) {
        throw new HttpException(
          'STUDENT_QUIZ_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return teacherQuiz;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentQuizById(id: number, user_id: number): Promise<any> {
    try {
      const studentQuiz = await this.studentQuizRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
        relations: [
          'teacher_quiz',
          'teacher_quiz.student_quiz',
          'teacher_quiz.quiz_question',
        ],
      });

      if (!studentQuiz) {
        throw new HttpException(
          'STUDENT_QUIZ_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return studentQuiz;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteStudentQuiz(id: number, user_id: number): Promise<any> {
    try {
      await this.studentQuizRepository.delete({
        id: id,
        created_by: user_id,
      });

      return {
        status: 200,
        message: 'Student Quiz deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createTeacherFileAssignment(
    data: CreateTeacherAssignmentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const courseLesson = await this.courseLessonRepository.findOne({
        where: {
          id: data.course_lesson_id,
        },
      });
      if (!courseLesson) {
        return {
          status: 500,
          message: 'No course lesson found.',
        };
      }

      const lessonActivity = await this.lessonActivityRepository.findOne({
        where: {
          id: data.lesson_activity_id,
        },
      });
      if (!lessonActivity) {
        return {
          status: 500,
          message: 'No lesson Activity found.',
        };
      }
      const fileAssignment = new TeacherFileAssignment();
      fileAssignment.created_by = user_id;
      fileAssignment.add_file = data.add_file;
      fileAssignment.maximum_no_of_file = data.maximum_no_of_file;
      fileAssignment.course_lesson = courseLesson;
      fileAssignment.lesson_activity = lessonActivity;
      await this.teacherFileAssignmentRepository.save(fileAssignment);
      return fileAssignment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateTeacherFileAssignment(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const teacherFileAssignment =
        await this.teacherFileAssignmentRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!teacherFileAssignment) {
        throw new HttpException(
          'TEACHER_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const courseLesson = await this.courseLessonRepository.findOne({
        where: {
          id: data.course_lesson_id,
        },
      });
      if (!courseLesson) {
        return {
          status: 500,
          message: 'No course lesson found.',
        };
      }
      delete data.course_lesson_id;
      data.course_lesson = courseLesson;

      const lessonActivity = await this.lessonActivityRepository.findOne({
        where: {
          id: data.lesson_activity_id,
        },
      });
      if (!lessonActivity) {
        return {
          status: 500,
          message: 'No lesson Activity found.',
        };
      }
      delete data.lesson_activity_id;
      data.lesson_activity = lessonActivity;
      await this.teacherFileAssignmentRepository.update(id, data);

      return {
        status: 200,
        message: 'Teacher file assignment updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTeacherFileAssignment(data: any): Promise<any> {
    try {
      const teacherFileAssignment =
        await this.teacherFileAssignmentRepository.find({
          order: {
            id: 'DESC',
          },
          take: data.take,
          skip: data.skip,
          relations: [
            'course_lesson',
            'student_file_assignment',
            'teacher_file_assignment_comment',
            'teacher_file_assignment_comment.teacher_file_assignment_comment_like',
          ],
        });
      if (!teacherFileAssignment.length) {
        return {
          status: 500,
          message: 'TEACHER_FILE_ASSIGNMENT_NOT_FOUND',
        };
      }
      return teacherFileAssignment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTeacherFileAssignmentById(id: number): Promise<any> {
    try {
      const teacherFileAssignment =
        await this.teacherFileAssignmentRepository.findOne({
          where: {
            id: id,
          },
          relations: ['course_lesson'],
        });

      if (!teacherFileAssignment) {
        throw new HttpException(
          'TEACHER_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return teacherFileAssignment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTeacherFileAssignmentByCourseId(id: number): Promise<any> {
    try {
      const teacherFileAssignment =
        await this.teacherFileAssignmentRepository.find({
          where: {
            course_lesson: {
              course_basic: {
                id: id,
              },
            },
          },
          relations: [
            'course_lesson',
            'course_lesson.course_basic',
            'student_file_assignment',
            'lesson_activity',
          ],
        });

      if (!teacherFileAssignment) {
        throw new HttpException(
          'TEACHER_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return teacherFileAssignment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteTeacherFileAssignmentById(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const teacherFileAssignment =
        await this.teacherFileAssignmentRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });

      if (!teacherFileAssignment) {
        throw new HttpException(
          'TEACHER_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.teacherFileAssignmentRepository.delete(id);

      return {
        status: 200,
        message: `Teacher file assignment Deleted successfully.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createStudentFileAssignment(
    data: CreateStudentAssignmentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const teacherFileAssignment =
        await this.teacherFileAssignmentRepository.findOne({
          where: {
            id: data.teacher_file_assignment_id,
          },
        });
      if (!teacherFileAssignment) {
        throw new HttpException(
          'TEACHER_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (
        teacherFileAssignment.maximum_no_of_file &&
        teacherFileAssignment.maximum_no_of_file >= data.add_file.length
      ) {
        const fileAssignment = new StudentFileAssignment();
        fileAssignment.created_by = user_id;
        fileAssignment.add_file = data.add_file;
        fileAssignment.teacher_file_assignment = teacherFileAssignment;
        await this.studentFileAssignmentRepository.save(fileAssignment);
        return fileAssignment;
      } else {
        return {
          status: 500,
          message: `add only ${teacherFileAssignment.maximum_no_of_file} files.`,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateStudentFileAssignment(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const teacherFileAssignment =
        await this.teacherFileAssignmentRepository.findOne({
          where: {
            id: data.teacher_file_assignment_id,
          },
        });
      if (!teacherFileAssignment) {
        throw new HttpException(
          'TEACHER_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      delete data.teacher_file_assignment_id;
      data.teacher_file_assignment = teacherFileAssignment;
      if (teacherFileAssignment.maximum_no_of_file >= data.add_file.length) {
        await this.studentFileAssignmentRepository.update(id, data);
        return {
          status: 200,
          message: 'Student file assignment updated successfully.',
        };
      } else {
        return {
          status: 500,
          message: `add only ${teacherFileAssignment.maximum_no_of_file} files.`,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentFileAssignment(data: any): Promise<any> {
    try {
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.find({
          order: {
            id: 'DESC',
          },
          take: data.take,
          skip: data.skip,
          relations: ['teacher_file_assignment'],
        });
      if (!studentFileAssignment.length) {
        return {
          status: 500,
          message: 'Student File Assignment Not Fount',
        };
      }
      return studentFileAssignment;
    } catch (error) {}
  }

  public async getStudentFileAssignmentById(id: number): Promise<any> {
    try {
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.findOne({
          where: {
            id: id,
          },
          relations: ['teacher_file_assignment'],
        });

      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return studentFileAssignment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentFileAssignmentByTeacherId(data: any): Promise<any> {
    try {
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.find({
          where: {
            teacher_file_assignment: { id: data.teacher_file_assignment_id },
          },
          take: data.take,
          skip: data.skip,
          relations: [
            'teacher_file_assignment',
            'student_file_assignment_grade',
            'student_file_assignment_feedback',
          ],
        });

      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      for (let i = 0; i < studentFileAssignment.length; i++) {
        studentFileAssignment[i].created_by = await this.getUser(
          studentFileAssignment[i].created_by,
        );
      }
      const total = await this.studentFileAssignmentRepository.count({
        where: {
          teacher_file_assignment: { id: data.teacher_file_assignment_id },
        },
        take: data.take,
        skip: data.skip,
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: studentFileAssignment,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteStudentFileAssignment(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });

      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.studentFileAssignmentRepository.delete(id);

      return {
        status: 200,
        message: `Student file assignment Deleted successfully.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createStudentFileAssignmentFeedback(
    data: CreateStudentAssignmentFeedbackDto,
    user_id: number,
  ): Promise<any> {
    try {
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.findOne({
          where: {
            id: data.student_file_assignment_id,
          },
        });
      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const existingFeedback =
        await this.studentFileAssignmentFeedbackRepository.findOne({
          where: {
            student_file_assignment: {
              id: data.student_file_assignment_id,
            },
            created_by: user_id,
          },
        });
      if (existingFeedback) {
        return {
          status: 500,
          message: 'Feedback already given',
        };
      }
      const feedback = new StudentFileAssignmentFeedback();
      feedback.created_by = user_id;
      feedback.student_file_assignment = studentFileAssignment;
      feedback.feedback = data.feedback;
      await this.studentFileAssignmentFeedbackRepository.save(feedback);

      return feedback;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateStudentFileAssignmentFeedback(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const studentFileFeedback =
        await this.studentFileAssignmentFeedbackRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!studentFileFeedback) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_FEEDBACK_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.findOne({
          where: {
            id: data.student_file_assignment_id,
          },
        });
      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      delete data.student_file_assignment_id;
      data.student_file_assignment = studentFileAssignment;

      await this.studentFileAssignmentFeedbackRepository.update(id, data);
      return {
        status: 200,
        message: 'Student file assignment Feedback updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createStudentFileAssignmentGrade(
    data: CreateStudentAssignmentGradeDto,
    user_id: number,
  ): Promise<any> {
    try {
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.findOne({
          where: {
            id: data.student_file_assignment_id,
          },
        });
      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const existingGrade =
        await this.studentFileAssignmentGradeRepository.findOne({
          where: {
            student_file_assignment: {
              id: data.student_file_assignment_id,
            },
            created_by: user_id,
          },
        });
      if (existingGrade) {
        return {
          status: 500,
          message: 'Grade already given',
        };
      }

      if (data.grade < 0 || data.grade > 100) {
        return {
          status: 500,
          message: 'Invalid Grade Range',
        };
      }
      const grade = new StudentFileAssignmentGrade();
      grade.created_by = user_id;
      grade.student_file_assignment = studentFileAssignment;
      grade.grade = data.grade;
      await this.studentFileAssignmentGradeRepository.save(grade);

      return grade;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateStudentFileAssignmentGrade(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const studentFileGrade =
        await this.studentFileAssignmentGradeRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!studentFileGrade) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_GRADE_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.findOne({
          where: {
            id: data.student_file_assignment_id,
          },
        });
      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      delete data.student_file_assignment_id;
      data.student_file_assignment = studentFileAssignment;

      await this.studentFileAssignmentGradeRepository.update(id, data);
      return {
        status: 200,
        message: 'Student file assignment Grade updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }


  public async getScore(data: ScoreDto): Promise<any> {
    try {
      const teacherQuiz: any = await this.teacherQuizRepository.find({
        where: {
          id: data.teacher_quiz_id,
          lesson_activity: { id: data.lesson_activity_id },
        },
        relations: ['quiz_question', 'student_quiz'],
      });

      if (!teacherQuiz) {
        return {
          status: 500,
          message: 'No teacher quiz found.',
        };
      }
      for (let i = 0; i < teacherQuiz.length; i++) {
        const studentQuiz = await this.studentQuizRepository.count({
          where: {
            teacher_quiz: {
              id: teacherQuiz[i].id,
            },
          },
        });
        const teacherAnswer = await this.teacherQuizQuestionRepository.find({
          where: {
            teacher_quiz: {
              id: teacherQuiz[i].id,
            },
          },
          relations: ['teacher_quiz'],
        });
        console.log('teacher', teacherAnswer);

        for (let j = 0; j < teacherAnswer.length; j++) {
          const studentAnswer = await this.studentQuizRepository.find({
            where: {
              quiz_question: {
                id: teacherAnswer[j].id,
              },
              teacher_quiz: {
                id: teacherAnswer[j].teacher_quiz.id,
              },
            },
          });
          console.log('studentAnswer', studentAnswer);
        }

        teacherQuiz[i].number_of_attempt = studentQuiz;
        teacherQuiz[i].score = 0;
        teacherQuiz[i].points = 0;
      }

      return teacherQuiz;
} catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  
  public async getFileAssignmentByUser(
    data: fileAssignmentGetDto,
  ): Promise<any> {
    try {
      const where: any =
        data.user_id === 0
          ? {
              teacher_file_assignment: {
                id: data.teacher_file_assignment_id,
                course_lesson: {
                  course_basic: {
                    id: data.course_id,
                  },
                },
              },
            }
          : {
              teacher_file_assignment: {
                id: data.teacher_file_assignment_id,
                course_lesson: {
                  course_basic: {
                    id: data.course_id,
                  },
                },
              },
              created_by: data.user_id,
            };
      const studentFileAssignment: any =
        await this.studentFileAssignmentRepository.find({
          where: {
            ...where,
          },
          relations: [
            'teacher_file_assignment',
            'teacher_file_assignment.course_lesson.teacher_quiz',
            'teacher_file_assignment.course_lesson.teacher_quiz.student_quiz',
            'teacher_file_assignment.lesson_activity',
            'student_file_assignment_grade',
            'student_file_assignment_feedback',
          ],
        });

      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      let totalGrade = 0;
      let lateSubmissionCount = 0;
      let missingSubmissionCount = 0;
      for (let i = 0; i < studentFileAssignment.length; i++) {
        studentFileAssignment[i].created_by = await this.getUser(
          studentFileAssignment[i].created_by,
        );
        const createdAt = new Date(studentFileAssignment[i].created_at);
        const dateDue = new Date(
          studentFileAssignment[i].teacher_file_assignment.date_due,
        );

        if (createdAt <= dateDue) {
          studentFileAssignment[i].assignment_status = 'RETURNED_ON_TIME';
        } else if (createdAt > dateDue) {
          studentFileAssignment[i].assignment_status = 'RETURNED_ON_LATE';
          lateSubmissionCount++;
        } else {
          studentFileAssignment[i].assignment_status = 'MISSING';
          missingSubmissionCount++;
        }
        for (
          let j = 0;
          j < studentFileAssignment[i].student_file_assignment_grade.length;
          j++
        ) {
          const grade =
            studentFileAssignment[i].student_file_assignment_grade[j].grade;
          totalGrade += parseFloat(grade);
        }
      }
      const averageGrade = totalGrade / studentFileAssignment.length;
      const totalAverageGarde = (averageGrade * 10) / 100;
      const formatted_forecast_value = totalAverageGarde.toFixed(2);
      return {
        data: studentFileAssignment,
        assignment_count: studentFileAssignment.length,
        average_grade: parseFloat(formatted_forecast_value)
          ? parseFloat(formatted_forecast_value)
          : 0,
        late_submission: lateSubmissionCount,
        missing_submission: missingSubmissionCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentGrade(data: any): Promise<any> {
    const take = data.limit || 10;
    const page = data.page || 1;
    const skip = (page - 1) * take;
    try {
      const condition: any = {
        take: take,
        skip: skip,
        relations: [
          'teacher_file_assignment',
          'student_file_assignment_grade',
          'student_file_assignment_feedback',
        ],
        where: {},
      };

      if (data.time_duration == 'LAST_MONTH') {
        const today = new Date();
        const startOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );

        condition.where.created_at = Between(startOfLastMonth, today);
      }
      if (data.time_duration == 'LAST_WEEK') {
        const today = new Date();
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 6);

        condition.where.created_at = Between(startOfLastWeek, today);
      }

      if (data.time_duration == 'LAST_3_MONTH') {
        const today = new Date();
        const startOfLast3Months = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          1,
        );

        condition.where.created_at = Between(startOfLast3Months, today);
      }
      const studentFileAssignment =
        await this.studentFileAssignmentRepository.find({
          ...condition,
          order: {
            created_at: 'DESC',
          },
        });

      if (!studentFileAssignment) {
        throw new HttpException(
          'STUDENT_FILE_ASSIGNMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      for (let i = 0; i < studentFileAssignment.length; i++) {
        studentFileAssignment[i].created_by = await this.getUser(
          studentFileAssignment[i].created_by,
        );
        for (
          let j = 0;
          j < studentFileAssignment[i].student_file_assignment_grade.length;
          j++
        ) {}
      }
      const total = await this.studentFileAssignmentRepository.count({
        ...condition,
      });
      const totalPages = Math.ceil(total / take);
      return {
        data: studentFileAssignment,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
