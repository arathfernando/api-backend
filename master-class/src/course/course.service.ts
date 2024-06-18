import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CLASS_FILTER,
  COURSE_STATUS,
  OPEN_CLASS_FILTER,
  TRUE_FALSE,
  YES_NO,
  REVIEW_FILTER,
  PAYMENT_METHOD,
  STATE,
  CLASS_SORT_BY,
  STATUS,
  INVITE_STATUS,
} from 'src/core/constant/enum.constant';
import { CreateCoursePaymentDto } from 'src/core/dtos/course/create-course-payment.dto';
import { UpdateCoursePaymentDto } from 'src/core/dtos/course/update-course-payment.dto';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  CourseBasic,
  CourseEnrolled,
  CoursePayment,
  CourseRating,
  CourseReaction,
  CourseReport,
  Instructors,
  ReviewsLike,
  SaveCourse,
  StudentBilling,
} from 'src/database/entities';
import { CreateCourseInstructorDto } from 'src/core/dtos/course/create-course-instructors.dto';
import { ILike, In, Not, Repository } from 'typeorm';
import {
  CourseReactionDto,
  NotificationFilterDataDto,
  SearchDataDto,
  SearchFilterDataDto,
} from 'src/core/dtos';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { QuestionAnswerDto } from 'src/core/dtos/course/course-faq.dto';
import { CourseFaq } from 'src/database/entities/course-faq.entity';
import { UpdateQuestionAnswerDto } from 'src/core/dtos/course/update-course-faq.dto';
import { CreateStudentBillingDto } from 'src/core/dtos/course/course-student-billing.dto';
import { CreateStudentPaymentDto } from 'src/core/dtos/course/course-student-payment.dto';
import { StudentPayment } from 'src/database/entities/curse-student-payment.entity';
import { CreateCourseRatingDto } from 'src/core/dtos/course/course-rating.dto';
import { CreateReviewsLikeDto } from 'src/core/dtos/course/reviews-like.dto';
import { OpenSearchFilterDataDto } from 'src/core/dtos/course/open-search-filter.dto';
import { CourseReviewFilterDto } from 'src/core/dtos/course/course-review-filter.dto';
import { SearchClassFilterDataDto } from 'src/core/dtos/course/search-class-filter.dto';
import { createCorseReportDto } from 'src/core/dtos/course/corse-report.dto';
import { IMailPayload } from 'src/core/interfaces';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { InviteSearchDataDto } from 'src/core/dtos/invite-search-data.dto';
import { InvitedStudent } from 'src/database/entities/invited-student.entity';

@Injectable()
export class CourseService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('TRANSACTION_SERVICE')
    private readonly transactionClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    private readonly s3Service: S3Service,
    @InjectRepository(CourseBasic)
    private readonly courseBasicRepository: Repository<CourseBasic>,
    @InjectRepository(CourseReport)
    private readonly courseReportRepository: Repository<CourseReport>,
    @InjectRepository(CoursePayment)
    private readonly coursePaymentRepository: Repository<CoursePayment>,
    @InjectRepository(Instructors)
    private readonly instructorsRepository: Repository<Instructors>,
    @InjectRepository(CourseReaction)
    private readonly courseReactionRepository: Repository<CourseReaction>,
    @InjectRepository(StudentBilling)
    private readonly studentBillingRepository: Repository<StudentBilling>,
    @InjectRepository(CourseEnrolled)
    private readonly courseEnrolledRepository: Repository<CourseEnrolled>,
    @InjectRepository(CourseFaq)
    private readonly courseFaqRepository: Repository<CourseFaq>,
    @InjectRepository(SaveCourse)
    private readonly saveCourseRepository: Repository<SaveCourse>,
    @InjectRepository(StudentPayment)
    private readonly studentPaymentRepository: Repository<StudentPayment>,
    @InjectRepository(InvitedStudent)
    private readonly invitedStudentRepository: Repository<InvitedStudent>,
    @InjectRepository(CourseRating)
    private readonly courseRatingRepository: Repository<CourseRating>,
    @InjectRepository(ReviewsLike)
    private readonly reviewsLikeRepository: Repository<ReviewsLike>,
    private readonly configService: ConfigService,
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

  public async getUser(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_id', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  public async getCourseCategoryById(id: number): Promise<any> {
    const category = await firstValueFrom(
      this.adminClient.send('get_course_category_by_id', id),
    );

    return category;
  }

  public async createCourse(
    data: any,
    avatar: any,
    user_id: number,
  ): Promise<any> {
    try {
      let course_img;

      if (avatar && typeof avatar != 'string') {
        avatar = await this.s3Service.uploadFile(avatar);
        course_img = avatar.Location;
      } else {
        course_img = avatar;
      }
      const courseBasic = new CourseBasic();
      courseBasic.course_image = course_img;
      courseBasic.course_category = data.course_category;
      courseBasic.course_requirements = data.course_requirements;
      courseBasic.what_you_will_learn = data.what_you_will_learn;
      courseBasic.course_catch_line = data.course_catch_line;
      courseBasic.course_description = data.course_description;
      courseBasic.course_title = data.course_title;
      courseBasic.language = data.language;
      courseBasic.start_date = data.start_date;
      courseBasic.end_date = data.end_date;
      courseBasic.status = data.status ? data.status : COURSE_STATUS.PENDING;
      courseBasic.created_by = user_id;
      courseBasic.goals = data.goals.split(',');
      courseBasic.status = COURSE_STATUS.PENDING;
      await this.courseBasicRepository.save(courseBasic);
      const courseCreateNotification = {
        notification_from: user_id,
        payload: courseBasic,
        content: 'New course created.',
        type: 'COURSE_CREATED',
      };

      await firstValueFrom(
        this.notificationClient.send<any>(
          'create_global_notification',
          JSON.stringify(courseCreateNotification),
        ),
      );
      return courseBasic;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourse(
    id: number,
    data: any,
    avatar: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where = user_id == 0 ? { id: id } : { id: id, created_by: user_id };
      const course = await this.courseBasicRepository.findOne({
        where: {
          ...where,
          id: id,
        },
      });

      if (!course) {
        throw new HttpException(
          'COURSE_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (avatar) {
        avatar = await this.s3Service.uploadFile(avatar);
        avatar = avatar.Location;
        delete data.course_image;
        data.course_image = avatar;
      }
      if (data.goals) {
        data.goals = data.goals.split(',');
      }
      await this.courseBasicRepository.update(id, data);
      return {
        status: 200,
        message: 'Course updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createCourseFaq(
    data: QuestionAnswerDto,
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
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      const faqResult = [];
      if (data.faq.length) {
        for (let i = 0; i < data.faq.length; i++) {
          const contestFaqs = new CourseFaq();
          contestFaqs.question = data.faq[i].question;
          contestFaqs.answer = data.faq[i].answer;
          contestFaqs.created_by = course.created_by;
          contestFaqs.course_basic = course;
          await this.courseFaqRepository.save(contestFaqs);

          faqResult.push(contestFaqs);
        }
      }
      return faqResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseFaq(
    id: number,
    data: UpdateQuestionAnswerDto,
    user_id: number,
  ): Promise<any> {
    try {
      await this.courseFaqRepository.find({
        where: {
          course_basic: {
            id: id,
          },
          created_by: user_id,
        },
      });
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });
      await this.courseFaqRepository.delete({
        course_basic: { id },
        created_by: user_id,
      });
      for (let i = 0; i < data.faq.length; i++) {
        const contestFaqs = new CourseFaq();
        contestFaqs.question = data.faq[i].question;
        contestFaqs.answer = data.faq[i].answer;
        contestFaqs.created_by = user_id;
        contestFaqs.course_basic = course;

        await this.courseFaqRepository.save(contestFaqs);
      }
      return {
        status: 200,
        message: 'Course Faq updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllCourse(data: any, user_id: number): Promise<any> {
    try {
      const where =
        user_id == 0
          ? {}
          : {
              created_by: user_id,
            };
      const course = await this.courseBasicRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
        where: where,
        relations: [
          'instructors',
          'course_payment',
          'course_chapter',
          'course_enrolled',
        ],
      });
      if (!course.length) {
        return {
          status: 500,
          message: 'No course found.',
        };
      }
      for (let i = 0; i < course.length; i++) {
        course[i].created_by = await this.getUserProfile(course[i].created_by);
        course[i].course_category = await this.getCourseCategoryById(
          course[i].course_category,
        );
      }
      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseById(id: number, user_id: number): Promise<any> {
    try {
      let allRating = 0;
      const course: any = await this.courseBasicRepository.findOne({
        where: {
          id: id,
        },
        relations: [
          'instructors',
          'course_payment',
          'course_chapter',
          'course_reaction',
          'course_faq',
          'course_rating',
        ],
      });
      if (!course) {
        return {
          status: 500,
          message: 'No course found.',
        };
      }
      const moreCourse = await this.courseBasicRepository.find({
        where: {
          created_by: course.created_by,
          id: Not(course.id),
        },
        relations: [
          'instructors',
          'course_payment',
          'course_chapter',
          'course_reaction',
        ],
      });
      const user = await this.getUserProfile(course.created_by);
      course.created_by = user;
      const contestGoals = await firstValueFrom(
        this.adminClient.send<any>(
          'get_goal_by_ids',
          JSON.stringify(course.goals),
        ),
      );

      if (contestGoals.length > 0) {
        course.goals = contestGoals;
      } else {
        course.goals = [];
      }
      for (let i = 0; i < course.course_rating.length; i++) {
        allRating =
          allRating + parseInt(course.course_rating[i].over_all_rating);
      }
      const studentCount = await this.courseEnrolledRepository.find({
        where: {
          course_basic: { id: course.id },
        },
      });
      const currantStudent = await this.courseEnrolledRepository.findOne({
        where: {
          course_basic: { id: course.id },
          user_id: user_id,
        },
        order: {
          id: 'DESC',
        },
      });
      const currentUserReaction = await this.courseReactionRepository.count({
        where: {
          created_by: user_id,
          course_basic: { id: course.id },
        },
      });

      const reviewCount = await this.courseRatingRepository.count({
        where: {
          course_basic: { id: course.id },
        },
      });

      const reviewer = await this.courseRatingRepository
        .query(`SELECT created_by , COUNT(created_by) as total
    FROM course_rating
    WHERE course_id = ${course.id}
    GROUP BY created_by
    ORDER BY total DESC
    `);
      const langRes = [];
      if (course.created_by.teacher_profile) {
        if (course.created_by.teacher_profile.language) {
          const language = course.created_by.teacher_profile.language;
          if (language.length != 0) {
            for (let j = 0; j < language.length; j++) {
              const interest = await firstValueFrom(
                this.adminClient.send('get_language_by_id', {
                  id: language[j],
                }),
              );
              langRes.push(interest);
            }
          }
        }
        course.created_by.teacher_profile.language = langRes;
      }
      let found = TRUE_FALSE.FALSE;
      for (let i = 0; i < studentCount.length; i++) {
        if (studentCount[i] && studentCount[i].user_id == user_id) {
          found = TRUE_FALSE.TRUE;
          break;
        }
      }

      course.is_student = found;
      course.review_count =
        allRating / reviewCount ? allRating / reviewCount : 0;
      course.reviewer_count = reviewer.length;
      course.teacher_profile = user.teacher_profile;
      course.reaction_status =
        currentUserReaction != 0 ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE;
      course.student_count = studentCount.length;
      course.current_user_invite_status = currantStudent;
      course.more_course = moreCourse;

      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseByCategory(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const where: any = {
        course_category: id,
        status: Not(COURSE_STATUS.DELETED),
      };

      if (data.search) {
        where.course_title = ILike(`%${data.search}%`);
      }

      if (data.language) {
        where.language = data.language;
      }

      const course: any = await this.courseBasicRepository.find({
        where: where,
        take: data.limit,
        skip: skip,
        relations: ['instructors', 'course_payment'],
      });

      if (!course) {
        return {
          status: 500,
          message: 'No course found.',
        };
      }

      for (let i = 0; i < course.length; i++) {
        const currentUserReaction = await this.courseReactionRepository.count({
          where: {
            created_by: user_id,
            course_basic: { id: course[i].id },
          },
        });

        const courseReactionCount = await this.courseReactionRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });

        const studentCount = await this.courseEnrolledRepository.find({
          where: {
            course_basic: { id: course[i].id },
          },
        });

        const reviewCount = await this.courseRatingRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });

        const reviewer = await this.courseRatingRepository
          .query(`SELECT created_by , COUNT(created_by) as total
      FROM course_rating
      WHERE course_id = ${course[i].id}
      GROUP BY created_by
      ORDER BY total DESC
      `);

        const user = await this.getUserProfile(Number(course[i].created_by));
        course[i].created_by = user;
        course[i].reaction_status =
          currentUserReaction != 0 ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE;

        for (let j = 0; j < studentCount.length; j++) {
          if (studentCount[j] && studentCount[j].created_by == user_id) {
            course[i].is_student = TRUE_FALSE.TRUE;
          } else {
            course[i].is_student = TRUE_FALSE.FALSE;
          }
        }

        course[i].total_reaction = courseReactionCount;
        course[i].student_count = studentCount.length;
        course[i].review_count = reviewCount;
        course[i].reviewer_count = reviewer.length;
      }
      const total = await this.courseBasicRepository.count({ where: where });
      const totalPages = Math.ceil(total / data.limit);

      return {
        data: course,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getOpenCourseByCategory(
    id: number,
    search: string,
  ): Promise<any> {
    try {
      let where;
      if (search) {
        where = {
          course_category: id,
          course_title: ILike(`%${search}%`),
        };
      } else {
        where = {
          course_category: id,
        };
      }
      const course: any = await this.courseBasicRepository.find({
        where: where,
        relations: ['instructors', 'course_payment'],
      });

      if (!course) {
        return {
          status: 500,
          message: 'No course found.',
        };
      }

      for (let i = 0; i < course.length; i++) {
        const courseReactionCount = await this.courseReactionRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });

        const studentCount = await this.courseEnrolledRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });
        const user = await this.getUserProfile(Number(course[i].created_by));
        course[i].created_by = user;
        course[i].total_reaction = courseReactionCount;

        course[i].student_count = studentCount;
        course[i].is_student =
          studentCount != 0 ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE;
      }

      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getOpenPopularCategory(): Promise<any> {
    try {
      const studentCount = await this.courseEnrolledRepository
        .query(`SELECT course_id , COUNT(course_id) as total
  FROM course_enrolled
  GROUP BY course_id 
  ORDER BY total DESC
  `);
      const course_id = await this.arrayColumn(studentCount, 'course_id');
      const course = await this.courseBasicRepository.find({
        where: {
          id: In(course_id),
        },
      });
      const response = [];
      let categoryId = await this.arrayColumn(course, 'course_category');
      categoryId = categoryId.filter((value, index, array) => {
        return array.indexOf(value) === index;
      });
      for (let i = 0; i < categoryId.length; i++) {
        const category = await this.getCourseCategoryById(categoryId[i]);
        response.push(category);
      }
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourse(id: number, user_id: number): Promise<any> {
    try {
      const where = user_id == 0 ? { id: id } : { id: id, created_by: user_id };
      const course = await this.courseBasicRepository.findOne({
        where: where,
      });
      if (!course) {
        return {
          status: 500,
          message: 'No course found.',
        };
      }
      await this.courseBasicRepository.delete(id);
      return {
        status: 200,
        message: 'Course deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async saveCourse(id: number, user_id: number): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!course) {
        return {
          status: 500,
          message: 'No course found.',
        };
      }
      const saveCourse = new SaveCourse();
      saveCourse.created_by = user_id;
      saveCourse.course_basic = course;
      await this.saveCourseRepository.save(saveCourse);
      return {
        status: 200,
        message: 'Course saved successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async removeSaveCourse(id: number, user_id: number): Promise<any> {
    try {
      const checkSave = await this.saveCourseRepository.findOne({
        where: {
          created_by: user_id,
          course_basic: {
            id: id,
          },
        },
      });
      if (!checkSave) {
        return {
          status: 500,
          message: 'No saved course found.',
        };
      }
      await this.saveCourseRepository.delete(checkSave.id);
      return {
        status: 200,
        message: 'Course removed successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createCoursePayment(
    data: CreateCoursePaymentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });
      if (!course) {
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      if (data.course_id) {
        const existingCourse = await this.coursePaymentRepository.findOne({
          where: {
            course_basic: {
              id: data.course_id,
            },
          },
        });

        if (existingCourse) {
          return {
            statusCode: 409,
            message: 'Course payment already exist',
          };
        }
      }
      const coursePayment = new CoursePayment();
      coursePayment.course_basic = course;
      coursePayment.installment = data.installment;
      coursePayment.created_by = user_id;
      coursePayment.pricing_currency = data.pricing_currency;
      coursePayment.pricing = data.pricing;
      coursePayment.pricing_type = data.pricing_type;
      const created = await this.coursePaymentRepository.save(coursePayment);
      await this.courseBasicRepository.update(
        {
          id: course.id,
        },
        {
          course_payment: created,
        },
      );
      return coursePayment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCoursePayment(
    id: number,
    data: UpdateCoursePaymentDto,
  ): Promise<any> {
    try {
      const coursePayment = await this.coursePaymentRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!coursePayment) {
        return {
          status: 500,
          message: 'No course payment found.',
        };
      }
      await this.coursePaymentRepository.update(id, data);
      return {
        status: 200,
        message: 'Course payment updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCoursePaymentByCourseId(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const coursePayment = await this.coursePaymentRepository.find({
        where: {
          created_by: user_id,
          course_basic: {
            id: id,
          },
        },
      });
      if (!coursePayment.length) {
        return {
          status: 500,
          message: 'No Course payment found.',
        };
      }
      return coursePayment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCoursePayment(id: number, user_id: number): Promise<any> {
    try {
      await this.coursePaymentRepository.delete({
        id: id,
        created_by: user_id,
      });
      return {
        status: 200,
        message: 'Course payment deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async searchCourse(
    data: SearchFilterDataDto,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const condition: any = {
        where: {
          status: COURSE_STATUS.ACTIVE,
        },

        take: data.limit,
        skip: skip,
        relations: [
          'course_payment',
          'course_chapter',
          'course_chapter.course_lesson',
          'course_rating',
        ],
      };
      if (data.search) {
        condition.where.course_title = ILike(`%${data.search}%`);
      }
      if (data.language) {
        condition.where.language = data.language;
      }
      if (data.class_filter == CLASS_FILTER.MY_CLASSES) {
        condition.where.created_by = user_id;
        condition.relations.push('course_enrolled');
      }
      if (data.class_filter == CLASS_FILTER.JUST_ADDED) {
        condition.order = { created_at: 'DESC' };
      }
      if (data.class_filter == CLASS_FILTER.KEEP_GOING) {
        condition.order = { created_at: 'DESC' };
      }
      if (data.class_filter == CLASS_FILTER.MOST_POPULAR) {
        const studentCount = await this.courseEnrolledRepository
          .query(`SELECT course_id , COUNT(course_id) as total
      FROM course_enrolled
      GROUP BY course_id 
      ORDER BY total DESC
      `);
        const course_id = await this.arrayColumn(studentCount, 'course_id');
        condition.where.id = In(course_id);
      }
      // if (data.class_filter == CLASS_FILTER.RECENTLY_VIEWED) {

      // }
      if (data.class_filter == CLASS_FILTER.TRENDING) {
        const studentCount = await this.courseEnrolledRepository
          .query(`SELECT course_id , COUNT(course_id) as total
      FROM course_reaction
      GROUP BY course_id 
      ORDER BY total DESC
      `);
        const course_id = await this.arrayColumn(studentCount, 'course_id');
        condition.where.id = In(course_id);
      }
      if (data.class_filter == CLASS_FILTER.SAVED_CLASSES) {
        const savedCourse = await this.saveCourseRepository.find({
          where: {
            created_by: user_id,
          },
          relations: ['course_basic'],
        });
        const course_basics = await this.arrayColumn(
          savedCourse,
          'course_basic',
        );
        const course_id = await this.arrayColumn(course_basics, 'id');
        condition.where.id = In(course_id);
      }
      if (data.class_filter == CLASS_FILTER.COURSE_ENROLLED) {
        const courseEnroll = await this.courseEnrolledRepository.find({
          where: {
            user_id: user_id,
          },
          relations: ['course_basic'],
        });
        const course_basics = await this.arrayColumn(
          courseEnroll,
          'course_basic',
        );
        const course_id = await this.arrayColumn(course_basics, 'id');
        condition.where.id = In(course_id);
      }
      const course: any = await this.courseBasicRepository.find(condition);

      for (let i = 0; i < course.length; i++) {
        let allRating = 0;
        const currentUserReaction = await this.courseReactionRepository.count({
          where: {
            created_by: user_id,
            course_basic: { id: course[i].id },
          },
        });
        const courseReactionCount = await this.courseReactionRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });
        const studentCount = await this.courseEnrolledRepository.find({
          where: {
            course_basic: { id: course[i].id },
          },
        });
        for (let j = 0; j < course[i].course_rating.length; j++) {
          allRating =
            allRating + parseInt(course[i].course_rating[j].over_all_rating);
        }
        const user = await this.getUserProfile(Number(course[i].created_by));
        course[i].created_by = user;
        course[i].total_reaction = courseReactionCount;
        const reviewCount = await this.courseRatingRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });

        const reviewer = await this.courseRatingRepository
          .query(`SELECT created_by , COUNT(created_by) as total
        FROM course_rating
        WHERE course_id = ${course[i].id}
        GROUP BY created_by
        ORDER BY total DESC
        `);

        for (let j = 0; j < studentCount.length; j++) {
          if (studentCount[j] && studentCount[j].created_by == user_id) {
            course[i].is_student = TRUE_FALSE.TRUE;
          } else {
            course[i].is_student = TRUE_FALSE.FALSE;
          }
        }
        course[i].reviewer_count = reviewer.length;
        course[i].reaction_status =
          currentUserReaction != 0 ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE;
        course[i].student_count = studentCount.length;
        course[i].review_count =
          allRating / reviewCount ? allRating / reviewCount : 0;
      }
      const total = await this.courseBasicRepository.count(condition);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: course,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async searchAllCourse(
    data: SearchClassFilterDataDto,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const condition: any = {
        where: {},
        take: data.limit,
        skip: skip,
        relations: [
          'course_payment',
          'course_chapter',
          'course_chapter.course_lesson',
        ],
      };
      if (data.search) {
        condition.where.course_title = ILike(`%${data.search}%`);
      }
      if (data.status != STATUS.ALL) {
        condition.where.status = data.status;
      }

      if (data.state == STATE.ALL) {
        let course_id = [];
        let user_course_id = [];
        const courseEnroll = await this.courseEnrolledRepository.find({
          where: {
            user_id: user_id,
          },
          relations: ['course_basic'],
        });
        if (courseEnroll.length) {
          const course_basics = await this.arrayColumn(
            courseEnroll,
            'course_basic',
          );
          course_id = await this.arrayColumn(course_basics, 'id');
        }
        const userCourse = await this.courseBasicRepository.find({
          where: {
            created_by: user_id,
          },
        });
        if (userCourse.length) {
          user_course_id = await this.arrayColumn(userCourse, 'id');
        }
        const courseIds = course_id.concat(user_course_id);
        condition.where.id = In(courseIds);
      }
      if (data.state == STATE.COURSE_ENROLLED) {
        const courseEnroll = await this.courseEnrolledRepository.find({
          where: {
            user_id: user_id,
          },
          relations: ['course_basic'],
        });
        const course_basics = await this.arrayColumn(
          courseEnroll,
          'course_basic',
        );
        const course_id = await this.arrayColumn(course_basics, 'id');
        condition.where.id = In(course_id);
      }
      if (data.state == STATE.MY_CLASSES) {
        condition.where.created_by = user_id;
        condition.relations.push('course_enrolled');
      }
      if (data.sort_by == CLASS_SORT_BY.DATE_ASCENDING) {
        condition.order = {
          id: 'ASC',
        };
      }
      if (data.sort_by == CLASS_SORT_BY.DATE_DESCENDING) {
        condition.order = {
          id: 'DESC',
        };
      }
      if (data.sort_by == CLASS_SORT_BY.LAST_OPEN) {
      }
      if (data.sort_by == CLASS_SORT_BY.NEW_ACTIVITIES) {
        condition.order = {
          id: 'DESC',
        };
      }
      const course: any = await this.courseBasicRepository.find(condition);

      for (let i = 0; i < course.length; i++) {
        const studentCount = await this.courseEnrolledRepository.find({
          where: {
            course_basic: { id: course[i].id },
          },
        });

        const user = await this.getUserProfile(Number(course[i].created_by));
        course[i].created_by = user;
        for (let j = 0; j < studentCount.length; j++) {
          if (studentCount[j] && studentCount[j].created_by == user_id) {
            course[i].is_student = TRUE_FALSE.TRUE;
          } else {
            course[i].is_student = TRUE_FALSE.FALSE;
          }
        }
        course[i].student_count = studentCount.length;
      }
      const total = await this.courseBasicRepository.count(condition);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: course,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async searchOpenCourse(data: OpenSearchFilterDataDto): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const condition: any = {
        where: {
          status: COURSE_STATUS.ACTIVE,
        },

        take: data.limit,
        skip: skip,
        relations: [
          'course_payment',
          'course_chapter',
          'course_chapter.course_lesson',
          'course_rating',
        ],
      };
      if (data.search) {
        condition.where.course_title = ILike(`%${data.search}%`);
      }
      if (data.class_filter == OPEN_CLASS_FILTER.JUST_ADDED) {
        condition.order = { created_at: 'DESC' };
      }
      if (data.class_filter == OPEN_CLASS_FILTER.MOST_POPULAR) {
        const studentCount = await this.courseEnrolledRepository
          .query(`SELECT course_id , COUNT(course_id) as total
      FROM course_enrolled
      GROUP BY course_id 
      ORDER BY total DESC
      `);
        const course_id = await this.arrayColumn(studentCount, 'course_id');
        condition.where.id = In(course_id);
      }
      if (data.class_filter == OPEN_CLASS_FILTER.KEEP_GOING) {
        condition.order = { created_at: 'DESC' };
      }

      if (data.class_filter == OPEN_CLASS_FILTER.TRENDING) {
        const studentCount = await this.courseEnrolledRepository
          .query(`SELECT course_id , COUNT(course_id) as total
      FROM course_reaction
      GROUP BY course_id 
      ORDER BY total DESC
      `);
        const course_id = await this.arrayColumn(studentCount, 'course_id');
        condition.where.id = In(course_id);
      }
      // if (data.class_filter == CLASS_FILTER.RECENTLY_VIEWED) {

      // }
      const course: any = await this.courseBasicRepository.find(condition);

      for (let i = 0; i < course.length; i++) {
        let allRating = 0;
        const courseReactionCount = await this.courseReactionRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });

        const studentCount = await this.courseEnrolledRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });

        for (let j = 0; j < course[i].course_rating.length; j++) {
          allRating =
            allRating + parseInt(course[i].course_rating[j].over_all_rating);
        }

        const user = await this.getUserProfile(Number(course[i].created_by));
        course[i].created_by = user;

        course[i].total_reaction = courseReactionCount;
        course[i].student_count = studentCount;
        course[i].is_student =
          studentCount != 0 ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE;

        const reviewCount = await this.courseRatingRepository.count({
          where: {
            course_basic: { id: course[i].id },
          },
        });
        const reviewer = await this.courseRatingRepository
          .query(`SELECT created_by , COUNT(created_by) as total
        FROM course_rating
        WHERE course_id = ${course[i].id}
        GROUP BY created_by
        ORDER BY total DESC
        `);

        course[i].reviewer_count = reviewer.length;
        course[i].review_count =
          allRating / reviewCount ? allRating / reviewCount : 0;
      }
      const total = await this.courseBasicRepository.count(condition);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: course,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async createCourseInstructors(
    data: CreateCourseInstructorDto,
    user_id: number,
  ): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });
      if (!course) {
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      const courseInstructor = new Instructors();
      courseInstructor.created_by = user_id;
      courseInstructor.course_basic = course;
      courseInstructor.instructor_id = data.instructor_id;
      courseInstructor.instructor_title = data.instructor_title;

      await this.instructorsRepository.save(courseInstructor);
      return courseInstructor;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseInstructors(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const courseInstructor = await this.instructorsRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!courseInstructor) {
        return {
          status: 500,
          message: 'No course instructors found.',
        };
      }
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_basic,
        },
      });

      delete data.course_basic;
      await this.instructorsRepository.delete({
        id: id,
      });

      const courseInstructors = new Instructors();
      courseInstructors.created_by = user_id;
      courseInstructors.course_basic = course;
      courseInstructors.instructor_id = data.instructor_id;
      courseInstructors.instructor_title = data.instructor_title;

      await this.instructorsRepository.save(courseInstructors);
      return {
        status: 200,
        message: 'Course Instructor updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseInstructorAdmin(
    id: number,
    search: string,
  ): Promise<any> {
    try {
      let where: any = {
        course_basic: {
          id: id,
        },
      };
      if (search) {
        const userData = await this.courseEnrolledRepository.query(
          `SELECT * from general_profile WHERE first_name LIKE LOWER('%${search}%') OR last_name LIKE LOWER('%${search}%')`,
        );
        const userIds = await this.arrayColumn(userData, 'user_id');
        where = [
          {
            course_basic: {
              id: id,
            },
            created_by: In(userIds),
          },
          {
            course_basic: {
              id: id,
            },
            instructor_title: ILike(`%${search}%`),
          },
        ];
      }
      const courseInstructor = await this.instructorsRepository.find({
        where: where,
      });
      if (!courseInstructor) {
        return {
          status: 500,
          message: 'No Course Instructor found.',
        };
      }
      const Course: any = [...courseInstructor];
      for (let i = 0; i < Course.length; i++) {
        Course[i].created_by = await this.getUser(Course[i].created_by);
      }
      return courseInstructor;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getCourseInstructor(id: number, user_id: number): Promise<any> {
    try {
      const courseInstructor = await this.instructorsRepository.find({
        where: {
          created_by: user_id,
          course_basic: {
            id: id,
          },
        },
      });
      if (!courseInstructor) {
        return {
          status: 500,
          message: 'No Course Instructor found.',
        };
      }
      return courseInstructor;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseInstructor(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const where = user_id == 0 ? { id: id } : { id: id, created_by: user_id };
      await this.instructorsRepository.delete(where);
      return {
        status: 200,
        message: 'Course instructor deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addCourseReaction(
    data: CourseReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const courseBasic = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });

      if (!courseBasic) {
        throw new HttpException(
          'COURSE_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const reaction = new CourseReaction();
      reaction.reaction = data.reaction;
      reaction.created_by = user_id;
      reaction.course_basic = courseBasic;

      await this.courseReactionRepository.save(reaction);

      return {
        status: 200,
        message: 'Course reaction added successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseReaction(
    data: CourseReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const reaction = await this.courseReactionRepository.findOne({
        where: {
          created_by: user_id,
          course_basic: {
            id: data.course_id,
          },
          reaction: YES_NO.YES,
        },
      });

      if (!reaction) {
        throw new HttpException(
          'COURSE_REACTION_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.courseReactionRepository.delete({
        id: reaction.id,
      });

      return {
        status: 200,
        message: 'Course reaction removed successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createCourseStudent(data: any, user_id: number): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });
      if (!course) {
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      const courseArr = [];
      for (let i = 0; i < data.user.length; i++) {
        const courseStudent = new CourseEnrolled();
        courseStudent.created_by = user_id;
        courseStudent.course_basic = course;
        courseStudent.user_id = data.user[i];
        courseArr.push(courseStudent);

        await this.courseEnrolledRepository.save(courseArr);

        const masterClassHost = await this.getUser(Number(course.created_by));
        const invitedUser = await this.getUser(data.user[i]);
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'MASTERCLASS_JOIN_REQUEST',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*masterclass*', course.course_title),
          content: admin_notification.notification_content
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*masterclass*', course.course_title),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: course.created_by,
          course_id: course.id,
          payload: courseStudent,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );

        const payload: IMailPayload = {
          template: 'MASTERCLASS_JOIN_REQUEST',
          payload: {
            emails: [invitedUser.email],
            data: {
              host_name: masterClassHost
                ? masterClassHost.general_profile.first_name
                : '',
              user_name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
              masterclass_name: course.course_title,
              link: `${this.configService.get<string>(
                'masterclass_join_request_url',
              )}/${course.id}`,
            },
            subject: `Someone wants to join your masterclass`,
          },
        };
        this.mailClient.emit('send_email', payload);
      }

      return courseArr;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async InviteCourseStudent(data: any, user_id: number): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });
      if (!course) {
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      const invitedUserNames = [];
      for (let i = 0; i < data.user.length; i++) {
        const existingStudent: any = await this.invitedStudentRepository.find({
          where: {
            user_id: data.user[i],
            course_basic: {
              id: course.id,
            },
          },
        });

        for (let j = 0; j < existingStudent.length; j++) {
          const existingUserNames = await this.getUser(
            existingStudent[j].user_id,
          );
          invitedUserNames.push(existingUserNames.general_profile.first_name);
        }
      }
      if (invitedUserNames.length) {
        const invitedNames = invitedUserNames.join(', ');
        return {
          status: 400,
          message: `${invitedNames} already invited.`,
        };
      }

      const courseArr = [];
      for (let i = 0; i < data.user.length; i++) {
        const courseStudent = new InvitedStudent();
        courseStudent.created_by = user_id;
        courseStudent.course_basic = course;
        courseStudent.user_id = data.user[i];
        courseStudent.invite_status = INVITE_STATUS.PENDING;
        courseArr.push(courseStudent);

        await this.invitedStudentRepository.save(courseArr);

        const masterClassHost = await this.getUser(data.user[i]);
        const invitedUser = await this.getUser(user_id);
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'MASTERCLASS_INVITE_STUDENT',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*masterclass*', course.course_title),
          content: admin_notification.notification_content
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*masterclass*', course.course_title),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: masterClassHost.id,
          course_id: course.id,
          payload: courseStudent,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );

        const payload: IMailPayload = {
          template: 'MASTERCLASS_INVITE_STUDENT',
          payload: {
            emails: [masterClassHost.email],
            data: {
              host_name: masterClassHost
                ? masterClassHost.general_profile.first_name
                : '',
              user_name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
              masterclass_name: course.course_title,
              link: `${this.configService.get<string>(
                'masterclass_join_request_url',
              )}/${course.id}`,
            },
            subject: `Someone invited you to join a masterclass`,
          },
        };
        this.mailClient.emit('send_email', payload);
      }

      return courseArr;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async ChangeInviteStatus(data: any, id: number): Promise<any> {
    try {
      const courseStudent = await this.invitedStudentRepository.findOne({
        where: { id: id },
      });

      if (!courseStudent) {
        return {
          status: 500,
          message: 'No course invited Student found.',
        };
      }
      await this.invitedStudentRepository.update(id, data);
      return {
        status: 200,
        message: 'Course Student invited Status updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseStudent(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const courseStudent = await this.courseEnrolledRepository.findOne({
        where: { id: id },
      });

      if (!courseStudent) {
        return {
          status: 500,
          message: 'No course Student found.',
        };
      }

      await this.courseEnrolledRepository.delete({
        id: id,
        user_id: user_id,
      });

      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });
      for (let i = 0; i < data.user.length; i++) {
        const courses = new CourseEnrolled();
        courses.created_by = user_id;
        courses.course_basic = course;
        courses.user_id = data.user[i];
        await this.courseEnrolledRepository.save(courses);
      }
      return {
        status: 200,
        message: 'Course Student updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseStudentByIdData(
    id: number,
    search: SearchDataDto,
  ): Promise<any> {
    try {
      const skip = search.limit * search.page - search.limit;
      let where: any = {
        course_basic: {
          id: id,
        },
      };
      if (search.search) {
        const userData = await this.courseEnrolledRepository.query(
          `SELECT * from general_profile WHERE LOWER(first_name) LIKE LOWER('%${search.search}%') OR LOWER(last_name) LIKE LOWER('%${search.search}%')`,
        );
        const userIds = await this.arrayColumn(userData, 'user_id');
        where = {
          course_basic: {
            id: id,
          },
          created_by: In(userIds),
        };
      }
      const courseEnroll = await this.courseEnrolledRepository.find({
        where: where,
        take: search.limit,
        skip,
        relations: ['course_basic'],
      });
      if (!courseEnroll) {
        return {
          status: 500,
          message: 'No Course Instructor found.',
        };
      }
      const Course: any = [...courseEnroll];
      for (let i = 0; i < Course.length; i++) {
        Course[i].created_by = await this.getUser(Course[i].created_by);
        Course[i].user_id = await this.getUser(Course[i].user_id);
      }
      const total = await this.courseEnrolledRepository.count({ where: where });
      const totalPages = Math.ceil(total / search.limit);
      return {
        data: courseEnroll,
        page: search.page,
        limit: search.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseInvitedStudentList(
    id: number,
    search: InviteSearchDataDto,
  ): Promise<any> {
    try {
      const skip = search.limit * search.page - search.limit;
      const where: any = {
        course_basic: {
          id: id,
        },
      };

      const courseEnroll = await this.invitedStudentRepository.find({
        where: where,
        take: search.limit,
        skip,
        relations: ['course_basic'],
      });
      if (!courseEnroll) {
        return {
          status: 500,
          message: 'No Course student found.',
        };
      }
      const Course: any = [...courseEnroll];
      for (let i = 0; i < Course.length; i++) {
        Course[i].created_by = await this.getUser(Course[i].created_by);
        Course[i].user_id = await this.getUser(Course[i].user_id);
      }
      const total = await this.invitedStudentRepository.count({ where: where });
      const totalPages = Math.ceil(total / search.limit);
      return {
        data: courseEnroll,
        page: search.page,
        limit: search.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseStudent(id: number): Promise<any> {
    try {
      const course = await this.courseEnrolledRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!course) {
        return {
          status: 500,
          message: 'No course Student found.',
        };
      }
      await this.courseEnrolledRepository.delete(id);
      return {
        status: 200,
        message: 'Course Student deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createStudentBilling(
    data: CreateStudentBillingDto,
    user_id: number,
  ): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });

      if (!course) {
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      const studentBilling = new StudentBilling();
      studentBilling.user_id = user_id;
      studentBilling.address = data.address;
      studentBilling.first_name = data.first_name;
      studentBilling.last_name = data.last_name;
      studentBilling.country = data.country;
      studentBilling.state = data.state;
      studentBilling.post_code = data.post_code;
      studentBilling.company = data.company;
      studentBilling.course_basic = course;
      await this.studentBillingRepository.save(studentBilling);

      return studentBilling;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateStudentBilling(id: number, data: any): Promise<any> {
    try {
      const courseStudent = await this.studentBillingRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!courseStudent) {
        return {
          status: 500,
          message: 'No student billing found.',
        };
      }

      if (data.course_id) {
        const course = await this.courseBasicRepository.findOne({
          where: {
            id: data.course_id,
          },
        });

        if (!course) {
          return {
            status: 500,
            message: 'No Course found.',
          };
        }
        data.course_basic = course;
        delete data.course_id;
      }
      await this.studentBillingRepository.update(id, data);
      return {
        status: 200,
        message: 'Student billing updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentBilling(user_id: number): Promise<any> {
    try {
      const courseStudent = await this.studentBillingRepository.find({
        where: {
          user_id: user_id,
        },
        relations: ['course_basic'],
      });

      if (!courseStudent.length) {
        return {
          status: 500,
          message: 'No student billing found.',
        };
      }
      return courseStudent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentBillingByCourse(id: number): Promise<any> {
    try {
      const courseStudent = await this.studentBillingRepository.find({
        where: {
          course_basic: {
            id: id,
          },
        },
        relations: ['course_basic'],
      });

      if (!courseStudent.length) {
        return {
          status: 500,
          message: 'No student billing found.',
        };
      }
      return courseStudent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteStudentBilling(id: number): Promise<any> {
    try {
      const courseStudent = await this.studentBillingRepository.findOne({
        where: {
          id: id,
        },
        relations: ['course_basic'],
      });

      if (!courseStudent) {
        return {
          status: 500,
          message: 'No student billing found.',
        };
      }
      await this.studentPaymentRepository.delete({
        id: id,
      });
      return {
        status: 200,
        message: 'Student billing deleted.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createStudentPayment(
    data: CreateStudentPaymentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });

      if (!course) {
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      if (data.payment_method == PAYMENT_METHOD.COMMUNITY_TOKEN) {
        const user = await this.getUserProfile(user_id);
        if (
          user.general_profile.hbb_points != '' &&
          user.general_profile.hbb_points < data.amount
        ) {
          return {
            status: 500,
            message: 'Not enough HBB Token found for payment.',
          };
        } else {
          const updateData = {
            id: user.general_profile.id,
            hbb_points: user.general_profile.hbb_points - data.amount,
          };
          await firstValueFrom(
            this.userClient.send<any>(
              'update_general_profile',
              JSON.stringify(updateData),
            ),
          );
        }
      }
      const studentBilling = new StudentPayment();
      studentBilling.user_id = user_id;
      studentBilling.payment_method = data.payment_method;
      studentBilling.payment_option = data.payment_option;
      studentBilling.amount = data.amount;
      studentBilling.course_basic = course;
      await this.studentPaymentRepository.save(studentBilling);
      const createTransaction = {
        transaction_from_type:
          data.payment_method == PAYMENT_METHOD.COMMUNITY_TOKEN
            ? 'HBB'
            : 'CURRENCY',
        transaction_to_type:
          data.payment_method == PAYMENT_METHOD.COMMUNITY_TOKEN
            ? 'HBB'
            : 'CURRENCY',
        transaction_amount: data.amount,
        area: 0,
        transaction_from: user_id,
        transaction_to: data.course_id,
        operation_type: 'BUY',
        transaction_for_type: 'COURSE',
        user_id: user_id,
      };
      await firstValueFrom(
        this.transactionClient.send<any>(
          'create_admin_transaction',
          JSON.stringify(createTransaction),
        ),
      );
      return studentBilling;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateStudentPayment(id: number, data: any): Promise<any> {
    try {
      const courseStudent = await this.studentPaymentRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!courseStudent) {
        return {
          status: 500,
          message: 'No student payment found.',
        };
      }

      if (data.course_id) {
        const course = await this.courseBasicRepository.findOne({
          where: {
            id: data.course_id,
          },
        });

        if (!course) {
          return {
            status: 500,
            message: 'No Course found.',
          };
        }
        data.course_basic = course;
        delete data.course_id;
      }
      await this.studentPaymentRepository.update(id, data);
      return {
        status: 200,
        message: 'Student billing updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentPayment(user_id: number): Promise<any> {
    try {
      const courseStudent = await this.studentPaymentRepository.find({
        where: {
          user_id: user_id,
        },
        relations: ['course_basic'],
      });

      if (!courseStudent.length) {
        return {
          status: 500,
          message: 'No student payment found.',
        };
      }
      return courseStudent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getStudentPaymentByCourse(id: number): Promise<any> {
    try {
      const courseStudent = await this.studentPaymentRepository.find({
        where: {
          course_basic: {
            id: id,
          },
        },
        relations: ['course_basic'],
      });

      if (!courseStudent.length) {
        return {
          status: 500,
          message: 'No student payment found.',
        };
      }
      return courseStudent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteStudentPayment(id: number): Promise<any> {
    try {
      const courseStudent = await this.studentBillingRepository.findOne({
        where: {
          id: id,
        },
        relations: ['course_basic'],
      });

      if (!courseStudent) {
        return {
          status: 500,
          message: 'No student payment found.',
        };
      }
      await this.studentPaymentRepository.delete({
        id: id,
      });
      return {
        status: 200,
        message: 'Student payment deleted.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createCourseRating(
    data: CreateCourseRatingDto,
    user_id: number,
  ): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });
      if (!course) {
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      const existingCourseRating = await this.courseRatingRepository.findOne({
        where: {
          course_basic: { id: data.course_id },
          created_by: user_id,
        },
      });
      if (existingCourseRating) {
        return {
          status: 500,
          message: "You've already added a rating for this course.",
        };
      }
      const courseRating = new CourseRating();
      courseRating.title = data.title;
      courseRating.comment = data.comment;
      courseRating.lesson_activity = data.lesson_activity;
      courseRating.lesson_content = data.lesson_content;
      courseRating.teacher_quality = data.teacher_quality;
      courseRating.over_all_rating = data.over_all_rating;
      courseRating.course_basic = course;
      courseRating.created_by = user_id;
      await this.courseRatingRepository.save(courseRating);
      return courseRating;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllCourseRating(data: any): Promise<any> {
    try {
      const courseRating = await this.courseRatingRepository.find({
        order: {
          id: 'DESC',
        },
        relations: ['course_basic'],
        take: data.take,
        skip: data.skip,
      });
      if (!courseRating.length) {
        return {
          status: 500,
          message: 'No Course Rating found.',
        };
      }
      for (let i = 0; i < courseRating.length; i++) {
        courseRating[i].created_by = await this.getUserProfile(
          courseRating[i].created_by,
        );
      }
      return courseRating;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseRating(id: number, data: any): Promise<any> {
    try {
      const courseRating = await this.courseRatingRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!courseRating) {
        return {
          status: 500,
          message: 'No course rating found.',
        };
      }
      if (data.course_id) {
        const course = await this.courseBasicRepository.findOne({
          where: {
            id: data.course_id,
          },
        });
        if (!course) {
          return {
            status: 500,
            message: 'No Course found.',
          };
        }
        data.course_basic = course;
        delete data.course_id;
      }
      await this.courseRatingRepository.update(id, data);
      return {
        status: 200,
        message: 'Course rating update successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseRatingByCourse(id: number): Promise<any> {
    try {
      const courseRating = await this.courseRatingRepository.find({
        where: {
          course_basic: {
            id: id,
          },
        },
      });
      return courseRating;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseRating(id: number): Promise<any> {
    try {
      const courseRatting = await this.courseRatingRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!courseRatting) {
        return {
          status: 500,
          message: 'Course rating not found.',
        };
      }
      await this.courseRatingRepository.delete(id);
      return {
        status: 200,
        message: 'Course rating deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createReviewsLike(
    data: CreateReviewsLikeDto,
    user_id: number,
  ): Promise<any> {
    try {
      const courseRating = await this.courseRatingRepository.findOne({
        where: {
          id: data.course_rating_id,
        },
        relations: ['course_basic'],
      });
      if (!courseRating) {
        return {
          status: 500,
          message: 'No Course Rating found.',
        };
      }
      const reviewsLikes = new ReviewsLike();
      reviewsLikes.course_rating = courseRating;
      reviewsLikes.helpful = data.helpful;
      reviewsLikes.created_by = user_id;
      await this.reviewsLikeRepository.save(reviewsLikes);

      const invitedUser = await this.getUser(user_id);

      const admin_notification = await firstValueFrom(
        this.adminClient.send<any>(
          'get_notification_by_type',
          'MASTERCLASS_REVIEWED_PROFILE',
        ),
      );
      const joinRequestNotification = {
        title: admin_notification.notification_title
          .replace('*user*', invitedUser.general_profile.first_name)
          .replace(
            '*masterclass name*',
            courseRating.course_basic.course_title,
          ),
        content: admin_notification.notification_content
          .replace('*user*', invitedUser.general_profile.first_name)
          .replace(
            '*masterclass name*',
            courseRating.course_basic.course_title,
          ),
        type: admin_notification.notification_type,
        notification_from: user_id,
        notification_to: courseRating.created_by,
        course_id: courseRating.course_basic.id,
        payload: reviewsLikes,
      };
      await firstValueFrom(
        this.notificationClient.send<any>(
          'create_notification',
          JSON.stringify(joinRequestNotification),
        ),
      );
      return reviewsLikes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateReviewsLike(id: number, data: any): Promise<any> {
    try {
      const reviewsLikes = await this.reviewsLikeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!reviewsLikes) {
        return {
          status: 500,
          message: 'No reviews found.',
        };
      }
      if (data.course_rating_id) {
        const courseRating = await this.courseRatingRepository.findOne({
          where: {
            id: data.course_rating_id,
          },
        });
        if (!courseRating) {
          return {
            status: 500,
            message: 'No Course Rating found.',
          };
        }
        data.course_rating = courseRating;
        delete data.course_rating_id;
      }
      await this.reviewsLikeRepository.update(id, data);
      return {
        status: 200,
        message: 'Review Like update successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getReviewsLike(id: number): Promise<any> {
    try {
      const reviewsLike = await this.reviewsLikeRepository.find({
        where: {
          course_rating: {
            id: id,
          },
        },
      });
      return reviewsLike;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteReviewsLike(id: number): Promise<any> {
    try {
      const reviewsLike = await this.reviewsLikeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!reviewsLike) {
        return {
          status: 500,
          message: 'Reviews Like not found.',
        };
      }
      await this.courseRatingRepository.delete(id);
      return {
        status: 200,
        message: 'Reviews Like deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getReviewsByCourseId(
    id: number,
    data: CourseReviewFilterDto,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const whereConn: any = {
        where: {
          course_basic: {
            id: id,
          },
        },
        take: data.limit,
        skip,
      };
      if (data.filter == REVIEW_FILTER.MOST_RECENT) {
        whereConn.order = { id: 'DESC' };
      }

      if (data.filter == REVIEW_FILTER.MOST_RELEVANT) {
        const reviewLike = await this.reviewsLikeRepository
          .query(`SELECT course_rating_id , COUNT(course_rating_id) as total
                  FROM reviews_like
                  GROUP BY course_rating_id
                  ORDER BY total DESC
                `);
        const ratting_id = await this.arrayColumn(
          reviewLike,
          'course_rating_id',
        );
        whereConn.where.id = In(ratting_id);
      }

      let allRating = 0;
      const reviews: any = await this.courseRatingRepository.find(whereConn);
      for (let i = 0; i < reviews.length; i++) {
        allRating = allRating + parseInt(reviews[i].over_all_rating);
        const user = await this.getUserProfile(Number(reviews[i].created_by));
        reviews[i].created_by = user;
        const like = await this.reviewsLikeRepository.findOne({
          where: {
            course_rating: { id: reviews[i].id },
          },
          order: { id: 'DESC' },
        });
        reviews[i].like_status = YES_NO.NO;
        if (like) {
          if (like.helpful === YES_NO.YES) {
            reviews[i].like_status = YES_NO.YES;
          } else {
            reviews[i].like_status = YES_NO.NO;
          }
        }
      }

      const reviewCount = await this.courseRatingRepository.count({
        where: {
          course_basic: {
            id: id,
          },
        },
      });

      const currentUserReaction = await this.courseReactionRepository.count({
        where: {
          course_basic: {
            id: id,
          },
        },
      });

      const reviewer = await this.courseRatingRepository
        .query(`SELECT created_by , COUNT(created_by) as total
      FROM course_rating
      WHERE course_id = ${id}
      GROUP BY created_by
      ORDER BY total DESC
      `);

      const individual = await this.courseRatingRepository
        .query(`SELECT over_all_rating , COUNT(over_all_rating) as total
      FROM course_rating
      WHERE course_id = ${id}
      GROUP BY over_all_rating
      ORDER BY total DESC
      `);

      const total = await this.courseRatingRepository.count(whereConn);
      const totalPages = Math.ceil(total / data.limit);

      return {
        individual: individual,
        data: reviews,
        review_count: allRating / reviewCount,
        reviewer_count: reviewer.length,
        reaction_status:
          currentUserReaction != 0 ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createCorseReport(
    data: createCorseReportDto,
    user_id: number,
  ): Promise<any> {
    try {
      const course = await this.courseBasicRepository.findOne({
        where: {
          id: data.course_id,
        },
      });

      if (!course) {
        return {
          status: 500,
          message: 'No Course found.',
        };
      }
      const courseReport = new CourseReport();
      courseReport.course_basic = course;
      courseReport.report_type = data.report_type;
      courseReport.content_type = data.content_type;
      courseReport.content_url = data.content_url;
      courseReport.description = data.description;
      courseReport.proof_of_your_copyright = data.proof_of_your_copyright;
      courseReport.created_by = user_id;
      await this.courseReportRepository.save(courseReport);
      return courseReport;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseReport(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const courseReport = await this.courseReportRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });
      if (!courseReport) {
        return {
          status: 500,
          message: 'No course report found.',
        };
      }
      if (data.course_id) {
        const course = await this.courseBasicRepository.findOne({
          where: {
            id: data.course_id,
          },
        });
        if (!course) {
          return {
            status: 500,
            message: 'No Course found.',
          };
        }
        data.course_basic = course;
        delete data.course_id;
      }
      await this.courseReportRepository.update(id, data);
      return {
        status: 200,
        message: 'Course report update successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseReport(id: number): Promise<any> {
    try {
      const courseReport = await this.courseReportRepository.findOne({
        where: { id: id },
        relations: ['course_basic'],
      });

      return courseReport;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCorseReportByCourse(id: number): Promise<any> {
    try {
      const courseReport = await this.courseReportRepository.find({
        where: {
          course_basic: {
            id: id,
          },
        },
        relations: ['course_basic'],
      });
      return courseReport;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseReport(id: number): Promise<any> {
    try {
      const courseReport = await this.courseReportRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!courseReport) {
        return {
          status: 500,
          message: 'Course report not found.',
        };
      }
      await this.courseReportRepository.delete(id);
      return {
        status: 200,
        message: 'Course report deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async courseNotification(
    data: NotificationFilterDataDto,
    user_id: number,
  ): Promise<any> {
    try {
      const newD = {
        data: data,
        user_id: user_id,
      };

      const createdRes = await firstValueFrom(
        this.notificationClient.send<any>(
          'get_course_notification',
          JSON.stringify(newD),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
