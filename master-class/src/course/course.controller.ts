import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import {
  CreateCourseDto,
  GetByIdDto,
  PaginationDto,
  UpdateCourseDto,
  SearchDataDto,
  CreateCoursePaymentDto,
  UpdateCoursePaymentDto,
  CreateCourseInstructorDto,
  UpdateCourseInstructorDto,
  SearchFilterDataDto,
  StudentDto,
  NotificationFilterDataDto,
} from 'src/core/dtos';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { CourseService } from './course.service';
import { CourseReactionDto } from '../core/dtos/course/course-reaction.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionAnswerDto } from 'src/core/dtos/course/course-faq.dto';
import { UpdateQuestionAnswerDto } from 'src/core/dtos/course/update-course-faq.dto';
import {
  CreateStudentBillingDto,
  UpdateStudentBillingDto,
} from 'src/core/dtos/course/course-student-billing.dto';
import {
  CreateStudentPaymentDto,
  UpdateStudentPaymentDto,
} from 'src/core/dtos/course/course-student-payment.dto';
import {
  CreateCourseRatingDto,
  UpdateCourseRatingDto,
} from 'src/core/dtos/course/course-rating.dto';
import {
  CreateReviewsLikeDto,
  UpdateReviewsLikeDto,
} from 'src/core/dtos/course/reviews-like.dto';
import { AllowUnauthorizedRequest } from 'src/core/decorator/allow.unauthorized.decorator';
import { OpenSearchFilterDataDto } from 'src/core/dtos/course/open-search-filter.dto';
import { OpenCategoryDto } from 'src/core/dtos/course/open-category.dto';
import { CourseReviewFilterDto } from 'src/core/dtos/course/course-review-filter.dto';
import { SearchClassFilterDataDto } from 'src/core/dtos/course/search-class-filter.dto';
import {
  UpdateCorseReportDto,
  createCorseReportDto,
} from 'src/core/dtos/course/corse-report.dto';
import { InviteSearchDataDto } from 'src/core/dtos/invite-search-data.dto';
import { ChangeStudentInviteStatusDto } from 'src/core/dtos/course/course-student-status.dto';
import { OpenCourseReviewFilterDto } from 'src/core/dtos/course/course-open-review-filter.dto';
import { OpenSearchDataDto } from 'src/core/dtos/open-search-data.dto';

@ApiTags('Master Class')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @MessagePattern('add_course')
  public async createCourseData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.courseService.createCourse(data, data.cover_img, user_id);
  }

  @MessagePattern('add_course_faq')
  public async createCourseFaqData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.courseService.createCourseFaq(data, user_id);
  }

  @MessagePattern('update_course_faq')
  public async updateCourseFaqData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return await this.courseService.updateCourseFaq(data.id, data, user_id);
  }

  @MessagePattern('update_course')
  public async updateCourseData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.courseService.updateCourse(
      data.id,
      data,
      data.course_img,
      0,
    );
  }

  @MessagePattern('get_course_by_id')
  public async getCourseByIdData(@Payload() id: number): Promise<any> {
    return this.courseService.getCourseById(id, 0);
  }

  @MessagePattern('delete_course')
  public async deleteCourseData(@Payload() id: number): Promise<any> {
    return this.courseService.deleteCourse(id, 0);
  }

  @MessagePattern('get_course')
  public async getCourseData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.courseService.getAllCourse(data, 0);
  }

  @MessagePattern('get_course_by_category_id')
  public async getCourseByCategoryIdData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.courseService.getCourseByCategory(data.id, data, 0);
  }

  @MessagePattern('add_course_payment')
  public async createCoursePaymentData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.courseService.createCoursePayment(data, 0);
  }

  @MessagePattern('update_course_payment')
  public async updateCoursePaymentData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.courseService.updateCoursePayment(data.id, data);
  }

  @MessagePattern('add_course_instructors')
  public async createCourseInstructorData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.courseService.createCourseInstructors(data, 0);
  }

  @MessagePattern('update_course_instructors')
  public async updateCourseInstructorData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.courseService.updateCourseInstructors(data.id, data, 0);
  }

  @MessagePattern('add_course_student')
  public async createCourseRatingData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.courseService.createCourseStudent(data, user_id);
  }

  @MessagePattern('update_course_student')
  public async updateCourseRatingAdmin(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return await this.courseService.updateCourseStudent(data.id, data, user_id);
  }

  @MessagePattern('get_course_student_by_id')
  public async getCourseStudentByIdData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.courseService.getCourseStudentByIdData(data.id, data.search);
  }

  @MessagePattern('delete_course_student')
  public async deleteCourseStudentAdmin(@Payload() id: number): Promise<any> {
    return this.courseService.deleteCourseStudent(id);
  }
  @MessagePattern('get_course_instructors_by_id')
  public async getCourseInstructorByIdData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.courseService.getCourseInstructorAdmin(data.id, data.search);
  }

  @MessagePattern('delete_course_instructors')
  public async deleteCourseInstructors(@Payload() id: number): Promise<any> {
    return this.courseService.deleteCourseInstructor(id, 0);
  }

  @MessagePattern('add_course_rating')
  public async createCourseStudentData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.courseService.createCourseRating(data, user_id);
  }

  @MessagePattern('get_all_course_rating')
  public async getAllCourseRatingData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.courseService.getAllCourseRating(data);
  }

  @MessagePattern('update_course_rating')
  public async updateCourseStudentAdmin(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.courseService.updateCourseRating(data.id, data);
  }

  @MessagePattern('get_course_rating_by_course_id')
  public async getCourseRatingByIdData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.courseService.getCourseRatingByCourse(data);
  }

  @MessagePattern('delete_course_rating')
  public async deleteCourseRatingData(@Payload() id: number): Promise<any> {
    return this.courseService.deleteCourseRating(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('course_image'))
  async createCourse(
    @UploadedFile() course_image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCourseDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createCourse(data, course_image, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('course_image'))
  async updateCourse(
    @Param() id: GetByIdDto,
    @UploadedFile() course_image: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateCourseDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.updateCourse(
      id.id,
      data,
      course_image,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-course')
  async getAllCourse(
    @Query(ValidationPipe) data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.courseService.getAllCourse(newD, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/save-course/:id')
  async saveCourse(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.saveCourse(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/save-course/:id')
  async removeSaveCourse(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.removeSaveCourse(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-course/search')
  async searchAllCourse(
    @Query(ValidationPipe) data: SearchClassFilterDataDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.searchAllCourse(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/search')
  async searchCourse(
    @Query(ValidationPipe) data: SearchFilterDataDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.searchCourse(data, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/search')
  async searchOpenCourse(
    @Query(ValidationPipe) data: OpenSearchFilterDataDto,
  ): Promise<any> {
    return await this.courseService.searchOpenCourse(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getCourseById(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.getCourseById(id.id, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/by-id')
  async getOpenCourseById(@Query() id: GetByIdDto): Promise<any> {
    return await this.courseService.getCourseById(id.id, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category/:id')
  async getCourseByCategory(
    @Param(ValidationPipe) id: GetByIdDto,
    @Query() data: SearchDataDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.getCourseByCategory(id.id, data, user_id);
  }

  @Get('/open/category/by-id')
  async getOpenCourseByCategoryId(
    @Query() data: OpenSearchDataDto,
  ): Promise<any> {
    return await this.courseService.getCourseByCategory(data.id, data, 0);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/category')
  async getOpenCourseByCategory(
    @Query(ValidationPipe) data: OpenCategoryDto,
  ): Promise<any> {
    return await this.courseService.getOpenCourseByCategory(
      data.id,
      data.search,
    );
  }

  @AllowUnauthorizedRequest()
  @Get('/open/popular-categories')
  async getOpenPopularCategory(): Promise<any> {
    return await this.courseService.getOpenPopularCategory();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteCourse(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.deleteCourse(data.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course-payment')
  async createCoursePayment(
    @Body(ValidationPipe) data: CreateCoursePaymentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createCoursePayment(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course-payment/:id')
  async updateCoursePayment(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCoursePaymentDto,
  ): Promise<any> {
    return await this.courseService.updateCoursePayment(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/course-payment/:id')
  async getCoursePayment(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.getCoursePaymentByCourseId(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/course-payment/:id')
  async deleteCoursePayment(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.deleteCoursePayment(data.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/instructor')
  async createCourseInstructors(
    @Body(ValidationPipe) data: CreateCourseInstructorDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createCourseInstructors(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course/instructor/:id')
  async updateCourseInstructors(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCourseInstructorDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.updateCourseInstructors(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/course/instructor/:id')
  async getCourseInstructor(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.getCourseInstructor(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/course/instructor/:id')
  async deleteCourseInstructor(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.deleteCourseInstructor(data.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/reaction')
  async addCourseReaction(
    @Body(ValidationPipe) data: CourseReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.addCourseReaction(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course/reaction')
  async updateCourseReaction(
    @Body(ValidationPipe) data: CourseReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.updateCourseReaction(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/student')
  async addCourseStudent(
    @Body(ValidationPipe) data: StudentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.courseService.createCourseStudent(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/invite/student')
  async InviteCourseStudent(
    @Body(ValidationPipe) data: StudentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.courseService.InviteCourseStudent(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course/invite/status/:id')
  async ChangeInviteStatus(
    @Body(ValidationPipe) data: ChangeStudentInviteStatusDto,
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return this.courseService.ChangeInviteStatus(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course/student/:id')
  async updateCourseStudent(
    @Body(ValidationPipe) data: StudentDto,
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.updateCourseStudent(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/course/student/:id')
  async getCourseStudent(
    @Param(ValidationPipe) id: GetByIdDto,
    @Query() data: SearchDataDto,
  ): Promise<any> {
    return this.courseService.getCourseStudentByIdData(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/course/invite/student/:id')
  async getCourseInvitedStudentList(
    @Param(ValidationPipe) id: GetByIdDto,
    @Query() data: InviteSearchDataDto,
  ): Promise<any> {
    return this.courseService.getCourseInvitedStudentList(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/course/student/:id')
  async deleteCourseStudent(@Param() data: GetByIdDto): Promise<any> {
    return this.courseService.deleteCourseStudent(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('course/course-faq')
  async createCourseFaq(
    @Body() data: QuestionAnswerDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createCourseFaq(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('course/course-faq/:id')
  async updateCourseCourseFaq(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateQuestionAnswerDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.updateCourseFaq(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/student/billing')
  async createCourseStudentBilling(
    @Body() data: CreateStudentBillingDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createStudentBilling(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/student/billing/:id')
  async updateCourseStudentBilling(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateStudentBillingDto,
  ): Promise<any> {
    return await this.courseService.updateStudentBilling(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/billing')
  async getStudentBilling(@CurrentUser() user_id: number): Promise<any> {
    return this.courseService.getStudentBilling(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/billing/:id')
  async getStudentBillingByCourseId(@Param() id: GetByIdDto): Promise<any> {
    return this.courseService.getStudentBillingByCourse(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/student/billing/:id')
  async deleteStudentBilling(@Param() data: GetByIdDto): Promise<any> {
    return this.courseService.deleteStudentBilling(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/student/payment')
  async createCourseStudentPayment(
    @Body() data: CreateStudentPaymentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createStudentPayment(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/student/payment/:id')
  async updateCourseStudentPayment(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateStudentPaymentDto,
  ): Promise<any> {
    return await this.courseService.updateStudentPayment(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/payment')
  async getStudentPayment(@CurrentUser() user_id: number): Promise<any> {
    return this.courseService.getStudentPayment(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/payment/:id')
  async getStudentPaymentByCourse(@Param() id: GetByIdDto): Promise<any> {
    return this.courseService.getStudentPaymentByCourse(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/student/payment/:id')
  async deleteStudentPayment(@Param() data: GetByIdDto): Promise<any> {
    return this.courseService.deleteStudentPayment(data.id);
  }
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/rating')
  async createCourseRating(
    @Body() data: CreateCourseRatingDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createCourseRating(data, user_id);
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

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/reviews/like')
  async createReviewsLike(
    @Body() data: CreateReviewsLikeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createReviewsLike(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/reviews/like/:id')
  async updateReviewsLike(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateReviewsLikeDto,
  ): Promise<any> {
    return await this.courseService.updateReviewsLike(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/reviews/like/:id')
  async getReviewsLike(@Param() id: GetByIdDto): Promise<any> {
    return this.courseService.getReviewsLike(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/reviews/like/:id')
  async deleteReviewsLike(@Param() data: GetByIdDto): Promise<any> {
    return this.courseService.deleteReviewsLike(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/reviews/course/:id')
  async getReviewsByCourseId(
    @Param() id: GetByIdDto,
    @Query() data: CourseReviewFilterDto,
  ): Promise<any> {
    return this.courseService.getReviewsByCourseId(id.id, data);
  }

  @Get('/open/reviews/course/by-id')
  async getOpenReviewsByCourseId(
    @Query() data: OpenCourseReviewFilterDto,
  ): Promise<any> {
    return this.courseService.getReviewsByCourseId(data.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/report')
  async createCorseReport(
    @Body() data: createCorseReportDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.createCorseReport(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/report/:id')
  async updateCourseReport(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCorseReportDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseService.updateCourseReport(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/report/:id')
  async getCourseReport(@Param() id: GetByIdDto): Promise<any> {
    return this.courseService.getCourseReport(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/report/course/:id')
  async getCorseReportByCourse(@Param() id: GetByIdDto): Promise<any> {
    return this.courseService.getCorseReportByCourse(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/report/:id')
  async deleteCourseReport(@Param() data: GetByIdDto): Promise<any> {
    return this.courseService.deleteCourseReport(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('course/notification')
  async courseNotification(
    @Query(ValidationPipe) data: NotificationFilterDataDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.courseService.courseNotification(data, user_id);
  }
}
