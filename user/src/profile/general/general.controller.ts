import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import {
  ChooseGoalDto,
  EducationDto,
  GetByIdDto,
  SocialMediaDto,
  UpdateGeneralProfileDto,
  UpdateSocialMediaDto,
  WorkExperienceDto,
  UpdateUserInterestDto,
  UserInterestDto,
  AddBadgeDto,
} from 'src/helper/dtos';
import {
  IEducation,
  ISocialMedia,
  IWorkExperience,
} from 'src/helper/interfaces';
import { IGeneralProfile } from 'src/helper/interfaces/IGeneralProfile';
import { GeneralService } from './general.service';

@ApiTags('General Profile')
@ApiBearerAuth()
@Controller('/profile')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @MessagePattern('update_general_profile')
  public async updateProfile(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.id;
    delete data.id;
    return await this.generalService.updateGeneralProfile(null, data, user_id);
  }

  @MessagePattern('update_work_experience')
  public async updateExperience(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.user_id;
    delete data.user_id;
    return this.generalService.updateAdminWorkExperience(data, user_id);
  }

  @MessagePattern('update_social_media')
  public async updateMedia(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.user_id;
    delete data.user_id;
    return this.generalService.updateAdminSocialMedia(data, user_id);
  }

  @MessagePattern('update_education')
  public async updateEducations(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.user_id;
    delete data.user_id;
    return this.generalService.updateAdminEducation(data, user_id);
  }

  @MessagePattern('update_user_interest')
  public async updateInterest(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.generalService.updateUserInterest(data, data.id);
  }

  @MessagePattern('update_goal')
  public async updateGoal(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.generalService.addGoals(data, data.id);
  }

  @MessagePattern('get_general_profile_by_id')
  public async getProfile(@Payload() data: any): Promise<any> {
    return this.generalService.getGeneralProfile(data.userId);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('/general')
  async updateGeneralProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateGeneralProfileDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.updateGeneralProfile(avatar, data, user_id);
  }

  @Get('/general/:id')
  async getGeneralProfileByUserId(
    @Param() id: GetByIdDto,
  ): Promise<IGeneralProfile> {
    return await this.generalService.getGeneralProfile(id.id);
  }

  @Get('/general')
  async getGeneralProfile(
    @CurrentUser() user_id: number,
  ): Promise<IGeneralProfile> {
    return await this.generalService.getGeneralProfile(user_id);
  }

  @Get('/work-experience')
  async getWorkExperience(
    @CurrentUser() user_id: number,
  ): Promise<IWorkExperience[]> {
    return await this.generalService.getWorkExperience(user_id);
  }

  @Post('/work-experience')
  async createWorkExperience(
    @Body(ValidationPipe) data: WorkExperienceDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.createWorkExperience(data, user_id);
  }

  @Put('/work-experience/:id')
  async updateWorkExperience(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: WorkExperienceDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.updateWorkExperience(id.id, data, user_id);
  }

  @Delete('/work-experience/:id')
  async deleteWorkExperience(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.deleteWorkExperience(id.id, user_id);
  }

  @Get('/education')
  async getEducation(@CurrentUser() user_id: number): Promise<IEducation[]> {
    return await this.generalService.getEducation(user_id);
  }

  @Post('/education')
  async createEducation(
    @Body(ValidationPipe) data: EducationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.createEducation(data, user_id);
  }

  @Put('/education/:id')
  async updateEducation(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: EducationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.updateEducation(id.id, data, user_id);
  }

  @Delete('/education/:id')
  async deleteEducation(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.deleteEducation(id.id, user_id);
  }

  @Get('/social-media')
  async getSocialMedia(
    @CurrentUser() user_id: number,
  ): Promise<ISocialMedia[]> {
    return await this.generalService.getSocialMedia(user_id);
  }

  @Post('/social-media')
  async createSocialMedia(
    @Body(ValidationPipe) data: SocialMediaDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.createSocialMedia(data, user_id);
  }

  @Put('/social-media/:id')
  async updateSocialMedia(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateSocialMediaDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.updateSocialMedia(id.id, data, user_id);
  }

  @Delete('/social-media/:id')
  async deleteSocialMedia(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.deleteSocialMedia(id.id, user_id);
  }

  @Get('/user-interest')
  async getUserInterest(
    @CurrentUser() user_id: number,
  ): Promise<ISocialMedia[]> {
    return await this.generalService.getUserInterests(user_id);
  }

  @Post('/user-interest')
  async createUserInterest(
    @Body(ValidationPipe) data: UserInterestDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.createUserInterest(data, user_id);
  }

  @Put('/user-interest')
  async updateUserInterest(
    @Body(ValidationPipe) data: UpdateUserInterestDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.updateUserInterest(data, user_id);
  }

  @Get('/goals')
  async getGoals(): Promise<any> {
    return await this.generalService.getGoals();
  }

  @Post('/choose-goals')
  async addGoals(
    @Body(ValidationPipe) data: ChooseGoalDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.addGoals(data, user_id);
  }

  @Post('/add-badge')
  async addBadge(
    @Body(ValidationPipe) data: AddBadgeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.generalService.addBadge(data, user_id);
  }
}
