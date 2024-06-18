import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {} from 'src/helper/dtos';
import { QuestionAnswerDto } from 'src/helper/dtos/course-faq.dto';
import {
  CreateCourseRatingDto,
  UpdateCourseRatingDto,
} from 'src/helper/dtos/course-rating.dto';
import { StudentDto } from 'src/helper/dtos/course-student.dto';
import { CreateCourseInstructorDto } from 'src/helper/dtos/create-course-instructors.dto';
import { CreateCoursePaymentDto } from 'src/helper/dtos/create-course-payment.dto';
import { CreateCourseDto } from 'src/helper/dtos/create-course.dto';
import { SearchDataDto } from 'src/helper/dtos/search-data.dto';
import { UpdateQuestionAnswerDto } from 'src/helper/dtos/update-course-faq.dto';
import { UpdateCourseInstructorDto } from 'src/helper/dtos/update-course-instructors.dto';
import { UpdateCoursePaymentDto } from 'src/helper/dtos/update-course-payment.dto';
import { UpdateCourseDto } from 'src/helper/dtos/update-course.dto';
import { S3Service } from 'src/helper/services/s3/s3.service';

@Injectable()
export class CourseService {
  constructor(
    @Inject('MASTER_CLASS') private readonly masterClassClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) {
    this.masterClassClient.connect();
  }

  async createCourse(data: CreateCourseDto, avatar: any): Promise<any> {
    try {
      let cover_img;

      if (avatar) {
        cover_img = await this.s3Service.uploadFile(avatar);
      }

      const adminDto: any = data;
      adminDto.cover_img = cover_img.Location;

      const createdRes = await firstValueFrom(
        this.masterClassClient.send('add_course', JSON.stringify(data)),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourse(
    data: UpdateCourseDto,
    id: number,
    avatar: any,
  ): Promise<any> {
    try {
      let cover_img;

      if (avatar) {
        cover_img = await this.s3Service.uploadFile(avatar);
      }

      const new_data: any = data;
      new_data.id = id;
      if (cover_img) {
        new_data.course_image = cover_img.Location;
      }
      await firstValueFrom(
        this.masterClassClient.send('update_course', JSON.stringify(new_data)),
      );

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseById(id: number): Promise<any> {
    try {
      const course = await firstValueFrom(
        this.masterClassClient.send('get_course_by_id', id),
      );
      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourse(id: number): Promise<any> {
    try {
      await firstValueFrom(this.masterClassClient.send('delete_course', id));
      return {
        status: 200,
        message: 'Course deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourse(data: any): Promise<any> {
    try {
      const course = await firstValueFrom(
        this.masterClassClient.send('get_course', JSON.stringify(data)),
      );

      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseByCategory(data: any): Promise<any> {
    try {
      const communityEventSpeaker = await firstValueFrom(
        this.masterClassClient.send(
          'get_course_by_category_id',
          JSON.stringify(data),
        ),
      );

      return communityEventSpeaker;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createCoursePayment(data: CreateCoursePaymentDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.masterClassClient.send('add_course_payment', JSON.stringify(data)),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCoursePayment(
    data: UpdateCoursePaymentDto,
    id: number,
  ): Promise<any> {
    const new_data: any = data;
    new_data.id = id;
    try {
      await firstValueFrom(
        this.masterClassClient.send(
          'update_course_payment',
          JSON.stringify(new_data),
        ),
      );

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  async createCourseInstructors(data: CreateCourseInstructorDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.masterClassClient.send(
          'add_course_instructors',
          JSON.stringify(data),
        ),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseInstructors(
    data: UpdateCourseInstructorDto,
    id: number,
  ): Promise<any> {
    const new_data: any = data;
    new_data.id = id;
    try {
      return await firstValueFrom(
        this.masterClassClient.send(
          'update_course_instructors',
          JSON.stringify(new_data),
        ),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseInstructorsById(
    id: number,
    data: SearchDataDto,
  ): Promise<any> {
    try {
      const course = await firstValueFrom(
        this.masterClassClient.send(
          'get_course_instructors_by_id',
          JSON.stringify({ id: id, search: data.search }),
        ),
      );
      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseInstructors(id: number): Promise<any> {
    try {
      await firstValueFrom(
        this.masterClassClient.send('delete_course_instructors', id),
      );
      return {
        status: 200,
        message: 'Course Student deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createCoursefaq(data: QuestionAnswerDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.masterClassClient.send('add_course_faq', JSON.stringify(data)),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCoursefaq(
    data: UpdateQuestionAnswerDto,
    id: number,
  ): Promise<any> {
    const new_data: any = data;
    new_data.id = id;
    try {
      const cc = await firstValueFrom(
        this.masterClassClient.send(
          'update_course_faq',
          JSON.stringify(new_data),
        ),
      );
      return cc;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  async createCourseStudent(data: StudentDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.masterClassClient.send('add_course_student', JSON.stringify(data)),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseStudent(data: StudentDto, id: number): Promise<any> {
    const new_data: any = data;
    new_data.id = id;
    try {
      const cc = await firstValueFrom(
        this.masterClassClient.send(
          'update_course_student',
          JSON.stringify(new_data),
        ),
      );

      return cc;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseStudentById(
    id: number,
    data: SearchDataDto,
  ): Promise<any> {
    try {
      const course = await firstValueFrom(
        this.masterClassClient.send(
          'get_course_student_by_id',
          JSON.stringify({ id: id, search: data.search }),
        ),
      );
      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseStudent(id: number): Promise<any> {
    try {
      await firstValueFrom(
        this.masterClassClient.send('delete_course_student', id),
      );
      return {
        status: 200,
        message: 'Course Student deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createCourseRating(data: CreateCourseRatingDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.masterClassClient.send('add_course_rating', JSON.stringify(data)),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllCorseRating(data: any): Promise<any> {
    try {
      const review = await firstValueFrom(
        this.masterClassClient.send(
          'get_all_course_rating',
          JSON.stringify(data),
        ),
      );
      return review;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCourseRating(
    id: number,
    data: UpdateCourseRatingDto,
  ): Promise<any> {
    const new_data: any = data;
    new_data.id = id;
    try {
      const courseRating = await firstValueFrom(
        this.masterClassClient.send(
          'update_course_rating',
          JSON.stringify(new_data),
        ),
      );

      return courseRating;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseRatingByCourse(id: number): Promise<any> {
    try {
      const course = await firstValueFrom(
        this.masterClassClient.send('get_course_rating_by_course_id', id),
      );
      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCourseRating(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.masterClassClient.send('delete_course_rating', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
