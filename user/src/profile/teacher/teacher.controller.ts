import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import { PaginationDto, TeacherDto, UpdateTeacherDto } from 'src/helper/dtos';
import { TeacherService } from './teacher.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Teacher Profile')
@ApiBearerAuth()
@Controller('/profile/teacher/')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @MessagePattern('update_teacher_profile')
  public async updateProfileForAdmin(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.id;
    delete data.id;
    return await this.teacherService.updateProfile(user_id, data);
  }

  @Post()
  async createProfile(
    @Body(ValidationPipe) data: TeacherDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.teacherService.createProfile(user, data);
  }

  @Put()
  async updateProfile(
    @Body(ValidationPipe) data: UpdateTeacherDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.teacherService.updateProfile(user, data);
  }

  @Get()
  async getProfile(@Query() data: PaginationDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.teacherService.getProfile(newD);
  }
}
