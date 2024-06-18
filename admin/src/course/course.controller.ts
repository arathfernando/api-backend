import {
  Body,
  Post,
  UploadedFile,
  Controller,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  Put,
  Param,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { GetByIdDto, PaginationDto } from 'src/helper/dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCourseDto } from 'src/helper/dtos/create-course.dto';
import { UpdateCourseDto } from 'src/helper/dtos/update-course.dto';
import { SearchDataDto } from 'src/helper/dtos/search-data.dto';
import { QuestionAnswerDto } from 'src/helper/dtos/course-faq.dto';
import { CreateCoursePaymentDto } from 'src/helper/dtos/create-course-payment.dto';
import { UpdateCoursePaymentDto } from 'src/helper/dtos/update-course-payment.dto';
import { CreateCourseInstructorDto } from 'src/helper/dtos/create-course-instructors.dto';
import { UpdateCourseInstructorDto } from 'src/helper/dtos/update-course-instructors.dto';
import { UpdateQuestionAnswerDto } from 'src/helper/dtos/update-course-faq.dto';
import { StudentDto } from 'src/helper/dtos/course-student.dto';
import {
  CreateCourseRatingDto,
  UpdateCourseRatingDto,
} from 'src/helper/dtos/course-rating.dto';

@ApiTags('Master Class')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('course_image'))
  async createCourse(
    @UploadedFile() course_image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCourseDto,
  ): Promise<any> {
    return await this.courseService.createCourse(data, course_image);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('course_image'))
  @Put('/:id')
  async updateCourse(
    @UploadedFile() course_image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCourseDto,
  ): Promise<any> {
    return await this.courseService.updateCourse(data, id.id, course_image);
  }

  @Get('/:id')
  async getCourseById(@Param() id: GetByIdDto): Promise<any> {
    return await this.courseService.getCourseById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteCourse(@Param() id: GetByIdDto): Promise<any> {
    return await this.courseService.deleteCourse(id.id);
  }

  @Get()
  async getCourse(@Query() data: PaginationDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.courseService.getCourse(newD);
  }

  @Get('/category/:id')
  async getCourseByCategory(
    @Param() id: GetByIdDto,
    @Query() data: SearchDataDto,
  ): Promise<any> {
    const newD = {
      id: id.id,
      data: data,
    };
    return await this.courseService.getCourseByCategory(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course-payment')
  async createCoursePayment(
    @Body(ValidationPipe) data: CreateCoursePaymentDto,
  ): Promise<any> {
    return await this.courseService.createCoursePayment(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course-payment/:id')
  async updateCoursePayment(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCoursePaymentDto,
  ): Promise<any> {
    return await this.courseService.updateCoursePayment(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course-instructor')
  async createCourseInstructors(
    @Body(ValidationPipe) data: CreateCourseInstructorDto,
  ): Promise<any> {
    return await this.courseService.createCourseInstructors(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course-instructor/:id')
  async updateCourseInstructors(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCourseInstructorDto,
  ): Promise<any> {
    return await this.courseService.updateCourseInstructors(data, id.id);
  }

  @Get('/course-instructor/:id')
  async getCourseInstructorsById(
    @Param() id: GetByIdDto,
    @Query() data: SearchDataDto,
  ): Promise<any> {
    return await this.courseService.getCourseInstructorsById(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/course-instructor/:id')
  async deleteCourseInstructors(@Param() id: GetByIdDto): Promise<any> {
    return await this.courseService.deleteCourseInstructors(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course-faq')
  async createCoursefaq(
    @Body(ValidationPipe) data: QuestionAnswerDto,
  ): Promise<any> {
    return await this.courseService.createCoursefaq(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course-faq/:id')
  async updateCoursefaq(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateQuestionAnswerDto,
  ): Promise<any> {
    return await this.courseService.updateCoursefaq(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/student')
  async createCourseStudent(
    @Body(ValidationPipe) data: StudentDto,
  ): Promise<any> {
    return await this.courseService.createCourseStudent(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course-student/:id')
  async updateCourseStudent(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: StudentDto,
  ): Promise<any> {
    return await this.courseService.updateCourseStudent(data, id.id);
  }

  @Get('/course-student/:id')
  async getCourseStudentById(
    @Param() id: GetByIdDto,
    @Query() data: SearchDataDto,
  ): Promise<any> {
    return await this.courseService.getCourseStudentById(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/course-student/:id')
  async deleteCourseStudent(@Param() id: GetByIdDto): Promise<any> {
    return await this.courseService.deleteCourseStudent(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/rating')
  async createCourseRating(@Body() data: CreateCourseRatingDto): Promise<any> {
    return await this.courseService.createCourseRating(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all/course/rating')
  async getAllCorseRating(@Query() data: PaginationDto): Promise<any> {
    return await this.courseService.getAllCorseRating(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course/rating/:id')
  async updateCourseRating(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCourseRatingDto,
  ): Promise<any> {
    return await this.courseService.updateCourseRating(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/course/rating/:id')
  async getStudentRatingByCourse(@Param() id: GetByIdDto): Promise<any> {
    return this.courseService.getCourseRatingByCourse(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/course/rating/:id')
  async deleteCourseRating(@Param() data: GetByIdDto): Promise<any> {
    return this.courseService.deleteCourseRating(data.id);
  }
}
