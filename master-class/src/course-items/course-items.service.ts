import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateCourseLessonDto,
  CreateLessonActivityDto,
  CreateCourseChapterDto,
  UpdateCourseChapterDto,
  UpdateCourseLessonDto,
} from 'src/core/dtos';
import { CreateLessonActivityCommentDto } from 'src/core/dtos/course/lesson-activity-comments.dto';
import {
  CommentLike,
  CourseBasic,
  LessonActivityComment,
  StudentFileAssignment,
  StudentQuiz,
} from 'src/database/entities';
import { CreateLessonActivityMarkDto } from 'src/core/dtos/course/lesson-activity-mark.dto';
import { CourseLesson } from 'src/database/entities';
import { CourseChapter } from 'src/database/entities/course-chapter.entity';
import { LessonActivityMark } from 'src/database/entities/lesson-activity-mark.entity';
import { LessonActivity } from 'src/database/entities/lesson-activity.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { CommentReactionDto } from 'src/core/dtos/course/activity-comment-reaction.dto';
import { REACTION_TYPE, TRUE_FALSE } from 'src/core/constant/enum.constant';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CourseItemsService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @InjectRepository(CourseBasic)
    private readonly courseBasicRepository: Repository<CourseBasic>,
    @InjectRepository(CourseLesson)
    private readonly courseLessonRepository: Repository<CourseLesson>,
    @InjectRepository(LessonActivity)
    private readonly lessonActivityRepository: Repository<LessonActivity>,
    @InjectRepository(CourseChapter)
    private readonly courseChapterRepository: Repository<CourseChapter>,
    @InjectRepository(LessonActivityComment)
    private readonly lessonActivityCommentRepository: Repository<LessonActivityComment>,
    @InjectRepository(LessonActivityMark)
    private readonly lessonActivityMarkRepository: Repository<LessonActivityMark>,
    @InjectRepository(CommentLike)
    private readonly lessonActivityLikeRepository: Repository<CommentLike>,
    @InjectRepository(StudentQuiz)
    private readonly studentQuizRepository: Repository<StudentQuiz>,
    @InjectRepository(StudentFileAssignment)
    private readonly studentFileAssignmentRepository: Repository<StudentFileAssignment>,
  ) {}

  public async getUserProfile(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_with_profile', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  public async createCourseChapter(
    data: CreateCourseChapterDto,
    user_id: number,
  ): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
          created_by: user_id,
        },
      });

      if (!course) {
        throw new HttpException(
          'COURSE_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const courseChapter = new CourseChapter();
      courseChapter.created_by = user_id;
      courseChapter.course_basic = course;
      courseChapter.chapter_description = data.chapter_description;
      courseChapter.chapter_title = data.chapter_title;
      courseChapter.course_access_type = data.course_access_type;
      courseChapter.media = data.media;
      await this.courseChapterRepository.save(courseChapter);
      return courseChapter;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseChapter(
    id: number,
    data: UpdateCourseChapterDto,
    user_id: number,
  ): Promise<any> {
    try {
      const courseChapter = await this.courseChapterRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });

      if (!courseChapter) {
        throw new HttpException(
          'COURSE_CHAPTER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.courseChapterRepository.update(id, data);

      return {
        status: 200,
        message: 'Course Chapter updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseChaptersByCourseId(id: number): Promise<any> {
    try {
      const courseChapters = await this.courseChapterRepository.find({
        where: {
          course_basic: {
            id: id,
          },
        },
      });

      if (!courseChapters && courseChapters.length <= 0) {
        throw new HttpException(
          'COURSE_CHAPTER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return courseChapters;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getLessonByChapterId(id: number): Promise<any> {
    try {
      const courseChapters = await this.courseLessonRepository.find({
        where: {
          course_chapter: {
            id: id,
          },
        },
        relations: ['course_basic', 'course_chapter'],
      });

      if (!courseChapters && courseChapters.length <= 0) {
        throw new HttpException(
          'COURSE_CHAPTER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return courseChapters;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseLessonsByChapterId(id: number): Promise<any> {
    try {
      const courseLesson = await this.courseChapterRepository.find({
        where: {
          course_basic: {
            id: id,
          },
        },
        relations: ['course_lesson'],
      });
      if (!courseLesson && courseLesson.length <= 0) {
        throw new HttpException(
          'COURSE_CHAPTER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return courseLesson;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseChapter(id: number, user_id: number): Promise<any> {
    try {
      await this.courseChapterRepository.delete({
        id: id,
        created_by: user_id,
      });

      return {
        status: 200,
        message: 'Course lesson deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createCourseLesson(
    data: CreateCourseLessonDto,
    user_id: number,
  ): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
          created_by: user_id,
        },
      });

      if (!course) {
        throw new HttpException(
          'COURSE_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const chapter = await this.courseChapterRepository.findOne({
        where: {
          id: data.chapter_id,
        },
      });

      if (!chapter) {
        throw new HttpException(
          'COURSE_CHAPTER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const courseLesson = new CourseLesson();
      courseLesson.created_by = user_id;
      courseLesson.course_basic = course;
      courseLesson.course_chapter = chapter;
      courseLesson.lesson_description = data.lesson_description;
      courseLesson.lesson_title = data.lesson_title;
      courseLesson.course_access_type = data.course_access_type;
      courseLesson.media = data.media;
      courseLesson.date = data.date;
      await this.courseLessonRepository.save(courseLesson);
      return courseLesson;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseLesson(
    id: number,
    data: UpdateCourseLessonDto,
    user_id: number,
  ): Promise<any> {
    try {
      const courseLesson = await this.courseLessonRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });
      if (!courseLesson) {
        return {
          status: 500,
          message: 'No course lesson found.',
        };
      }

      const chapter = await this.courseChapterRepository.findOne({
        where: {
          id: data.chapter_id,
        },
      });
      if (!chapter) {
        return {
          status: 500,
          message: 'No course chapter found.',
        };
      }

      delete data.chapter_id;
      courseLesson.course_chapter = chapter;
      await this.courseLessonRepository.save(courseLesson);
      await this.courseLessonRepository.update(id, data);
      return {
        status: 200,
        message: 'Course Lesson updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseLessonByCourseId(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const courseLesson: any = await this.courseLessonRepository.find({
        where: {
          course_basic: {
            id: id,
          },
        },
        relations: [
          'lesson_activity',
          'course_chapter',
          'teacher_file_assignment',
          'teacher_file_assignment.student_file_assignment',
        ],
      });
      if (!courseLesson.length) {
        return {
          status: 500,
          message: 'No Course Lesson found.',
        };
      }
      for (let i = 0; i < courseLesson.length; i++) {
        if (courseLesson[i].lesson_activity) {
          for (let j = 0; j < courseLesson[i].lesson_activity.length; j++) {
            const lessonActivityMark: any =
              await this.lessonActivityMarkRepository.findOne({
                where: {
                  lesson_activity: {
                    id: courseLesson[i].lesson_activity[j].id,
                  },
                  created_by: user_id,
                },
                order: { id: 'DESC' },
              });
            courseLesson[i].lesson_activity[
              j
            ].current_user_lesson_activity_mark = lessonActivityMark
              ? lessonActivityMark
              : [];
          }
        }
      }
      return courseLesson;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseLesson(id: number, user_id: number): Promise<any> {
    try {
      await this.courseLessonRepository.delete({
        id: id,
        created_by: user_id,
      });
      return {
        status: 200,
        message: 'Course lesson deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createLessonActivity(
    data: CreateLessonActivityDto,
    user_id: number,
  ): Promise<any> {
    try {
      const lesson = await this.courseLessonRepository.findOne({
        where: {
          id: data.lesson_id,
          created_by: user_id,
        },
      });
      if (!lesson) {
        return {
          status: 500,
          message: 'No Lesson found.',
        };
      }
      const lessonActivity = new LessonActivity();
      lessonActivity.course_lesson = lesson;
      lessonActivity.created_by = user_id;
      lessonActivity.file_description = data.file_description;
      lessonActivity.file_name = data.file_name;
      lessonActivity.file_type = data.file_type;
      lessonActivity.file_url = data.file_url;
      await this.lessonActivityRepository.save(lessonActivity);
      return lessonActivity;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateLessonActivity(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const lessonActivity = await this.lessonActivityRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });
      if (!lessonActivity) {
        return {
          status: 500,
          message: 'No lesson activity found.',
        };
      }
      if (data.lesson_id) {
        const lesson = await this.courseLessonRepository.findOne({
          where: {
            id: data.lesson_id,
            created_by: user_id,
          },
        });
        if (!lesson) {
          return {
            status: 500,
            message: 'No Lesson found.',
          };
        }
        delete data.lesson_id;
        data.course_lesson = lesson;
      }
      await this.lessonActivityRepository.update(id, data);
      return {
        status: 200,
        message: 'Lesson Activity updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getLessonActivityByLessonId(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const lessonActivity = await this.lessonActivityRepository.find({
        where: {
          created_by: user_id,
          course_lesson: {
            id: id,
          },
        },
        relations: ['course_lesson', 'teacher_quiz', 'teacher_file_assignment'],
      });
      if (!lessonActivity.length) {
        return {
          status: 500,
          message: 'No lesson activity found.',
        };
      }
      return lessonActivity;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getLessonActivityById(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      console.log('id', id);

      const lessonActivity: any = await this.lessonActivityRepository.findOne({
        where: {
          id: id,
        },
        relations: [
          'lesson_activity_comment',
          'course_lesson',
          'teacher_quiz',
          'teacher_file_assignment',
        ],
      });
      if (!lessonActivity) {
        return {
          status: 500,
          message: 'No lesson activity found.',
        };
      }
      const lessonActivityPrev = await this.lessonActivityRepository.findOne({
        where: {
          id: LessThan(id),
          course_lesson: { id: lessonActivity.course_lesson.id },
        },
        order: {
          id: 'DESC',
        },
        relations: ['lesson_activity_mark'],
      });
      const lessonActivityNext = await this.lessonActivityRepository.findOne({
        where: {
          id: MoreThan(id),
          course_lesson: { id: lessonActivity.course_lesson.id },
        },
        order: {
          id: 'ASC',
        },
        relations: ['lesson_activity_mark'],
      });
      const reaction = await this.lessonActivityCommentRepository.find({
        where: {
          lesson_activity: {
            id: id,
          },
        },
        relations: ['comment_like'],
      });
      lessonActivity.lesson_activity_comment = reaction;
      lessonActivity.next_lesson = lessonActivityNext;
      lessonActivity.prev_lesson = lessonActivityPrev;
      lessonActivity.created_by = await this.getUserProfile(
        lessonActivity.created_by,
      );
      const lessonActivityMark: any =
        await this.lessonActivityMarkRepository.findOne({
          where: {
            lesson_activity: { id: lessonActivity.id },
            created_by: user_id,
          },
          order: { id: 'DESC' },
        });
      lessonActivity.current_user_lesson_activity_mark = lessonActivityMark
        ? lessonActivityMark
        : [];

      for (let i = 0; i < lessonActivity.teacher_quiz.length; i++) {
        const studentQuiz: any = await this.studentQuizRepository.findOne({
          where: {
            teacher_quiz: {
              id: lessonActivity.teacher_quiz[i].id,
            },
            created_by: user_id,
          },
          order: { id: 'DESC' },
        });
        lessonActivity.teacher_quiz[i].current_user_answer = studentQuiz
          ? studentQuiz
          : [];
      }

      for (let i = 0; i < lessonActivity.teacher_file_assignment.length; i++) {
        const studentFileAssignment: any =
          await this.studentFileAssignmentRepository.findOne({
            where: {
              teacher_file_assignment: {
                id: lessonActivity.teacher_file_assignment[i].id,
              },
              created_by: user_id,
            },
            order: { id: 'DESC' },
          });
        lessonActivity.teacher_file_assignment[i].current_user_file_submission =
          studentFileAssignment ? studentFileAssignment : [];
      }

      for (let i = 0; i < lessonActivity.lesson_activity_comment.length; i++) {
        if (lessonActivity.lesson_activity_comment[i].created_by > 0) {
          lessonActivity.lesson_activity_comment[i].created_by =
            await this.getUserProfile(
              lessonActivity.lesson_activity_comment[i].created_by,
            );
        }
        lessonActivity.lesson_activity_comment[i].reaction_status =
          TRUE_FALSE.FALSE;
        for (
          let j = 0;
          j < lessonActivity.lesson_activity_comment[i].comment_like.length;
          j++
        ) {
          if (!lessonActivity.lesson_activity_comment[i].comment_like[j]) {
            lessonActivity.lesson_activity_comment[i].reaction_status =
              TRUE_FALSE.FALSE;
          } else if (
            lessonActivity.lesson_activity_comment[i].comment_like[j] &&
            lessonActivity.lesson_activity_comment[i].comment_like[j]
              .created_by == user_id
          ) {
            lessonActivity.lesson_activity_comment[i].reaction_status =
              TRUE_FALSE.TRUE;
          }
        }
      }

      return lessonActivity;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteLessonActivity(id: number, user_id: number): Promise<any> {
    try {
      await this.lessonActivityRepository.delete({
        id: id,
        created_by: user_id,
      });
      return {
        status: 200,
        message: 'Lesson activity deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createActivityComment(
    data: CreateLessonActivityCommentDto,
    user_id: number,
  ): Promise<any> {
    const lessonActivity = await this.lessonActivityRepository.findOne({
      where: {
        id: data.lesson_activity_id,
      },
    });
    if (!lessonActivity) {
      return {
        status: 500,
        message: 'No Lesson Activity found.',
      };
    }
    const activityComments = new LessonActivityComment();
    activityComments.comment = data.comment;
    activityComments.lesson_activity = lessonActivity;

    if (data.parent_comment_id && data.parent_comment_id > 0) {
      const parentComment = await this.lessonActivityCommentRepository.findOne({
        where: {
          id: data.parent_comment_id,
        },
      });

      if (!parentComment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      activityComments.parent_comment = parentComment.id;
      activityComments.parent = parentComment;
    }
    activityComments.created_by = user_id;

    await this.lessonActivityCommentRepository.save(activityComments);
    return activityComments;
  }

  public async createLessonActivityMark(
    data: CreateLessonActivityMarkDto,
    user_id: number,
  ): Promise<any> {
    try {
      const lesson_activity = await this.lessonActivityRepository.findOne({
        where: {
          id: data.lesson_activity_id,
        },
      });
      if (!lesson_activity) {
        return {
          status: 500,
          message: 'No Lesson found.',
        };
      }
      const lessonActivityMark = new LessonActivityMark();
      lessonActivityMark.created_by = user_id;
      lessonActivityMark.seen_unseen = data.seen_unseen;
      lessonActivityMark.lesson_activity = lesson_activity;
      await this.lessonActivityMarkRepository.save(lessonActivityMark);
      return lessonActivityMark;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateLessonActivityMark(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const lessonActivityMark =
        await this.lessonActivityMarkRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!lessonActivityMark) {
        return {
          status: 500,
          message: 'No lesson activity mark found.',
        };
      }
      if (data.lesson_activity_id) {
        const lessonActivity = await this.lessonActivityRepository.findOne({
          where: {
            id: data.lesson_id,
            created_by: user_id,
          },
        });
        if (!lessonActivity) {
          return {
            status: 500,
            message: 'No Lesson Activity found.',
          };
        }
        delete data.lesson_activity_id;
        data.course_lesson = lessonActivity;
      }
      await this.lessonActivityMarkRepository.update(id, data);
      return {
        status: 200,
        message: 'Lesson Activity mark updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getLessonActivityMarkByLessonActivityId(
    id: number,
  ): Promise<any> {
    try {
      const lessonActivityMark = await this.lessonActivityMarkRepository.find({
        where: {
          lesson_activity: {
            id: id,
          },
        },
      });
      if (!lessonActivityMark.length) {
        return {
          status: 500,
          message: 'No lesson activity mark found.',
        };
      }
      return lessonActivityMark;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteLessonActivityMark(id: number): Promise<any> {
    try {
      await this.lessonActivityMarkRepository.delete({
        id: id,
      });
      return {
        status: 200,
        message: 'Lesson activity mark deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateActivityComment(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const lessonActivityComment =
        await this.lessonActivityCommentRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!lessonActivityComment) {
        return {
          status: 500,
          message: 'No lesson activity comment found.',
        };
      }
      if (data.lesson_activity_id) {
        const lessonActivity = await this.lessonActivityRepository.findOne({
          where: {
            id: data.lesson_activity_id,
          },
        });
        if (!lessonActivity) {
          return {
            status: 500,
            message: 'No Lesson Activity found.',
          };
        }
        delete data.lesson_activity_id;
        data.lesson_activity = lessonActivity;
      }
      await this.lessonActivityCommentRepository.update(id, data);
      return {
        status: 200,
        message: 'Lesson Activity comment updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteActivityComment(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      await this.lessonActivityCommentRepository.delete({
        id: id,
        created_by: user_id,
      });
      return {
        status: 200,
        message: 'Lesson activity comment deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async commentReaction(
    id: number,
    data: CommentReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const comment = await this.lessonActivityCommentRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!comment) {
        return {
          status: 200,
          message: 'No Comment found.',
        };
      }

      const commentLike = await this.lessonActivityLikeRepository.findOne({
        where: {
          lesson_activity_comment: {
            id: id,
          },
          created_by: user_id,
        },
      });
      if (data.reaction_type === REACTION_TYPE.LIKE && !commentLike) {
        const reaction = new CommentLike();
        reaction.lesson_activity_comment = comment;
        reaction.created_by = user_id;
        reaction.reaction = data.reaction_type;
        await this.lessonActivityLikeRepository.save(reaction);
      } else if (data.reaction_type === REACTION_TYPE.DISLIKE && commentLike) {
        const like = await this.lessonActivityLikeRepository.findOne({
          where: {
            lesson_activity_comment: {
              id: id,
            },
          },
        });
        await this.lessonActivityLikeRepository.delete(like.id);
      }

      return {
        status: 200,
        message: `${data.reaction_type} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
