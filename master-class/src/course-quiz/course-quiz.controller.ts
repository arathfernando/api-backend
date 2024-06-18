import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CourseQuizService } from './course-quiz.service';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import {
  StudentQuizDto,
  UpdateStudentQuizDto,
} from 'src/core/dtos/course/student-quiz.dto';
import { GetByIdDto, PaginationDto } from 'src/core/dtos';
import {
  CreateTeacherAssignmentDto,
  UpdateTeacherAssignmentDto,
} from 'src/core/dtos/course/teacher-file-assignment.dto';
import {
  CreateStudentAssignmentDto,
  UpdateStudentAssignmentDto,
} from 'src/core/dtos/course/student-file-assignment.dto';
import { TeacherPaginationDto } from 'src/core/dtos/teacher-pagination.dto';
import {
  CreateStudentAssignmentFeedbackDto,
  UpdateStudentAssignmentFeedbackDto,
} from 'src/core/dtos/course/student-file-assignment-feedback.dto';
import {
  CreateStudentAssignmentGradeDto,
  UpdateStudentAssignmentGradeDto,
} from 'src/core/dtos/course/student-file-assignment-grade.dto';
import { QuizAllProcessDto } from 'src/core/dtos/course/teacher-quiz-all-process-dto';

import { ScoreDto } from 'src/core/dtos/get-score.dto';
import { fileAssignmentGetDto } from 'src/core/dtos/get-file-assignment.dto';
import { GradePaginationDto } from 'src/core/dtos/grade-pagination-filter.dto';

@ApiTags('Quiz')
@Controller('course')
export class CourseQuizController {
  constructor(private readonly courseQuizService: CourseQuizService) {}

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/teacher/quiz/all-process')
  async quizAllProcess(
    @Body(ValidationPipe) data: QuizAllProcessDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.quizAllProcess(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/teacher/quiz/:id')
  async getTeacherQuizById(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.courseQuizService.getTeacherQuizById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/teacher/quiz/:id')
  async deleteTeacherQuizById(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.deleteTeacherQuiz(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/teacher/quiz')
  async getTeacherQuiz(
    @Query(ValidationPipe) data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.courseQuizService.getTeacherQuiz(newD, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/quiz/course-lesson/:id')
  async getStudentQuizByCourseLessonId(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.getStudentQuizByCourseLessonId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/teacher/file-assignment')
  async createTeacherFileAssignment(
    @Body() data: CreateTeacherAssignmentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.createTeacherFileAssignment(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/teacher/file-assignment/:id')
  async updateTeacherFileAssignment(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateTeacherAssignmentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.updateTeacherFileAssignment(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/teacher/file-assignment')
  async getTeacherFileAssignment(
    @Query(ValidationPipe) data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.courseQuizService.getTeacherFileAssignment(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/teacher/file-assignment/:id')
  async getTeacherFileAssignmentById(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.courseQuizService.getTeacherFileAssignmentById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/teacher/file-assignment/course/:id')
  async getTeacherFileAssignmentByCourseId(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.courseQuizService.getTeacherFileAssignmentByCourseId(
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/teacher/file-assignment/:id')
  async deleteTeacherFileAssignmentById(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.deleteTeacherFileAssignmentById(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/student/quiz')
  async createStudentQuiz(
    @Body(ValidationPipe) data: StudentQuizDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.createStudentQuiz(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/student/quiz/:id')
  async updateStudentQuiz(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateStudentQuizDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.updateStudentQuiz(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/quiz/teacher-quiz/:id')
  async getStudentQuizByTeacherQuizId(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.getStudentQuizByTeacherQuizId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/quiz/:id')
  async getStudentQuizById(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.getStudentQuizById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/student/quiz/:id')
  async deleteStudentQuiz(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.deleteStudentQuiz(data.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/student/file-assignment')
  async createStudentFileAssignment(
    @Body() data: CreateStudentAssignmentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.createStudentFileAssignment(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/student/file-assignment/:id')
  async updateStudentFileAssignment(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateStudentAssignmentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.updateStudentFileAssignment(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/file-assignment')
  async getStudentFileAssignment(
    @Query(ValidationPipe) data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.courseQuizService.getStudentFileAssignment(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/file-assignment/:id')
  async getStudentFileAssignmentById(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.courseQuizService.getStudentFileAssignmentById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/file-assignment/teacher-file-assignment/:id')
  async getStudentFileAssignmentByTeacherId(
    @Query(ValidationPipe) data: TeacherPaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.courseQuizService.getStudentFileAssignmentByTeacherId(
      newD,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/student/file-assignment/:id')
  async deleteStudentFileAssignment(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.deleteStudentFileAssignment(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/student/file-assignment/feedback')
  async createStudentFileAssignmentFeedback(
    @Body() data: CreateStudentAssignmentFeedbackDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.createStudentFileAssignmentFeedback(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/student/file-assignment/feedback/:id')
  async updateStudentFileAssignmentFeedback(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateStudentAssignmentFeedbackDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.updateStudentFileAssignmentFeedback(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/student/file-assignment/grade')
  async createStudentFileAssignmentGrade(
    @Body() data: CreateStudentAssignmentGradeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.createStudentFileAssignmentGrade(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/student/file-assignment/grade/:id')
  async updateStudentFileAssignmentGrade(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateStudentAssignmentGradeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.courseQuizService.updateStudentFileAssignmentGrade(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student-quiz/score')
  async getScore(@Query() data: ScoreDto): Promise<any> {
    return await this.courseQuizService.getScore(data);
  }
  
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/student-file-assignment/user')
  async getFileAssignmentByUser(
    @Query(ValidationPipe) data: fileAssignmentGetDto,
  ): Promise<any> {
    return await this.courseQuizService.getFileAssignmentByUser(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/student/grad')
  async getStudentGrade(
    @Query(ValidationPipe) data: GradePaginationDto,
  ): Promise<any> {
    return await this.courseQuizService.getStudentGrade(data);
  }
}
