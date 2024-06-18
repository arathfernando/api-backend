import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import {
  CreateCourseChapterDto,
  CreateCourseLessonDto,
  CreateLessonActivityDto,
  GetByIdDto,
  UpdateCourseChapterDto,
  UpdateCourseLessonDto,
  UpdateLessonActivityDto,
} from 'src/core/dtos';
import { CommentReactionDto } from 'src/core/dtos/course/activity-comment-reaction.dto';
import {
  CreateLessonActivityCommentDto,
  UpdateLessonActivityCommentDto,
} from 'src/core/dtos/course/lesson-activity-comments.dto';
import {
  CreateLessonActivityMarkDto,
  UpdateLessonActivityMarkDto,
} from 'src/core/dtos/course/lesson-activity-mark.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { CourseItemsService } from './course-items.service';

@ApiTags('Chapters / Lessons')
@Controller('course')
export class CourseItemsController {
  constructor(private readonly courseItemsService: CourseItemsService) {}

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/chapter')
  async createCourseChapter(
    @Body(ValidationPipe) data: CreateCourseChapterDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.createCourseChapter(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course/chapter/:id')
  async updateCourseChapter(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCourseChapterDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.updateCourseChapter(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/course/chapter/:id')
  async getCourseChapter(@Param(ValidationPipe) id: GetByIdDto): Promise<any> {
    return await this.courseItemsService.getCourseChaptersByCourseId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('course-lesson/chpater/:id')
  async getLessonByChapterId(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.courseItemsService.getLessonByChapterId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/course/chapter/lessons/:id')
  async getCourseChapterLessons(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.courseItemsService.getCourseLessonsByChapterId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/course/chapter/:id')
  async deleteCourseChapter(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.deleteCourseChapter(data.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/lesson')
  async createCourseLesson(
    @Body(ValidationPipe) data: CreateCourseLessonDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.createCourseLesson(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/course/lesson/:id')
  async updateCourseLesson(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCourseLessonDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.updateCourseLesson(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/course/lesson/:id')
  async getCourseLesson(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.getCourseLessonByCourseId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/course/lesson/:id')
  async deleteCourseLesson(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.deleteCourseLesson(data.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/lesson-activity')
  async createLessonActivity(
    @Body(ValidationPipe) data: CreateLessonActivityDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.createLessonActivity(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/lesson-activity/:id')
  async updateLessonActivity(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateLessonActivityDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.updateLessonActivity(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/lesson-activity/:id')
  async getLessonActivity(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.getLessonActivityById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/lesson-activity/lesson/:id')
  async getLessonActivityByLesson(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.getLessonActivityByLessonId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/lesson-activity/:id')
  async deleteLessonActivity(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.deleteLessonActivity(data.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/course/lesson-activity/comments')
  async createActivityComment(
    @Body() data: CreateLessonActivityCommentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.createActivityComment(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/lesson-activity/mark')
  async createLessonActivityMark(
    @Body(ValidationPipe) data: CreateLessonActivityMarkDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.createLessonActivityMark(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/lesson-activity/mark/:id')
  async updateLessonActivityMark(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateLessonActivityMarkDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.updateLessonActivityMark(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/lesson-activity/mark/:id')
  async getLessonActivityMark(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.courseItemsService.getLessonActivityMarkByLessonActivityId(
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/lesson-activity/mark/:id')
  async deleteLessonActivityMark(@Param() data: GetByIdDto): Promise<any> {
    return await this.courseItemsService.deleteLessonActivityMark(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/lesson-activity/comments/:id')
  async updateActivityComment(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateLessonActivityCommentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.updateActivityComment(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/lesson-activity/comments/:id')
  async deleteActivityComment(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.deleteActivityComment(
      data.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/lesson-activity/comments/reaction/:id')
  async commentReaction(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: CommentReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseItemsService.commentReaction(id.id, data, user_id);
  }
}
