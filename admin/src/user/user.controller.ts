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
import {
  ChooseGoalDto,
  CreatePartnerDto,
  GetByIdDto,
  HubbersTeamProfileDto,
  PaginationDto,
  UpdateEducationDto,
  UpdateGeneralProfileDto,
  UpdateHubbersTeamProfileDto,
  UpdateHubbersTeamProfileOrderDto,
  UpdateSocialMediaDto,
  UpdateUserInterestDto,
  UpdateWorkExpDto,
} from 'src/helper/dtos';
import { UserCreateDto } from 'src/helper/dtos/create-user.dto';
import { UpdateUserDto } from 'src/helper/dtos/update-user.dto';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { UserService } from './user.service';
import { UpdatePartnerDto } from 'src/helper/dtos/update-partner.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Post()
  async createUser(
    @UploadedFile() avatar: Express.Multer.File,
    @Body(ValidationPipe) data: UserCreateDto,
  ): Promise<any> {
    return await this.userService.createUser(avatar, data);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('/:id')
  async updateUser(
    @UploadedFile() avatar: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateUserDto,
  ): Promise<any> {
    return await this.userService.updateUser(avatar, data, id.id);
  }

  @Get()
  async getAllUsers(@Query() data: PaginationDto): Promise<any> {
    return await this.userService.getAllUsers(data.limit, data.page);
  }

  @Get('/:id')
  async getUser(@Param() id: GetByIdDto): Promise<any> {
    return await this.userService.getUser(id.id);
  }

  @Get('/profile/general/:id')
  async getGeneralProfileByUserId(@Param() id: GetByIdDto): Promise<any> {
    return await this.userService.getGeneralProfileByUserId(id.id);
  }

  @Delete('/:id')
  async deleteBasicType(@Param() id: GetByIdDto): Promise<any> {
    return await this.userService.deleteUser(id.id);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('/general/:id')
  async updateGeneralProfile(
    @Param() id: GetByIdDto,
    @UploadedFile() avatar: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateGeneralProfileDto,
  ): Promise<any> {
    return this.userService.updateGeneralProfile(avatar, data, id.id);
  }

  @Put('/work-experience/:id')
  async updateWorkExperience(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateWorkExpDto,
  ): Promise<any> {
    return this.userService.updateWorkExperience(data, id.id);
  }

  @Put('/social-media/:id')
  async updateSocialMedia(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateSocialMediaDto,
  ): Promise<any> {
    return this.userService.updateSocialMedia(data, id.id);
  }

  @Put('/education/:id')
  async updateEducation(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateEducationDto,
  ): Promise<any> {
    return this.userService.updateEducation(data, id.id);
  }

  @Put('/user-interest/:id')
  async updateUserInterest(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateUserInterestDto,
  ): Promise<any> {
    return this.userService.updateUserInterest(data, id.id);
  }

  @Put('/goal/:id')
  async updateUserGoal(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: ChooseGoalDto,
  ): Promise<any> {
    return this.userService.updateUserGoal(data, id.id);
  }

  @Post('/users-partner')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('partner_image'))
  public async createPartner(
    @UploadedFile() partner_image: Express.Multer.File,
    @Body(ValidationPipe) data: CreatePartnerDto,
  ): Promise<any> {
    return await this.userService.createPartner(data, partner_image);
  }

  @Put('/users-partner/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('partner_image'))
  public async updatePartner(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdatePartnerDto,
    @UploadedFile() partner_image: Express.Multer.File,
  ): Promise<any> {
    return await this.userService.updatePartner(id.id, data, partner_image);
  }

  @Get('/users-partner/partners')
  public async getAllPartner(@Query() data: PaginationDto): Promise<any> {
    return await this.userService.getPartners(data);
  }

  @Get('/users-partner/:id')
  public async getPartnerById(@Param() id: GetByIdDto): Promise<any> {
    return await this.userService.getPartnerById(id.id);
  }

  @Delete('/users-partner/:id')
  public async deletePartner(@Param() id: GetByIdDto): Promise<any> {
    return await this.userService.deletePartner(id.id);
  }

  @Post('/hubber-team-profile')
  async createProfile(
    @Body(ValidationPipe) data: HubbersTeamProfileDto,
  ): Promise<any> {
    return this.userService.createHubberTeamProfile(data);
  }

  @Get('/hubber-team-profile/get-all')
  async getProfile(@Query() data: PaginationDto): Promise<any> {
    return this.userService.getHubberTeamProfile(data);
  }

  @Delete('/hubber-team-profile/remove/:id')
  async removeHubberProfile(@Param() id: GetByIdDto): Promise<any> {
    return this.userService.removeHubberProfile(id.id);
  }

  @Put('/hubber-team-profile/order')
  async updateProfileOrder(
    @Body(ValidationPipe) data: UpdateHubbersTeamProfileOrderDto,
  ): Promise<any> {
    return this.userService.updateHubberTeamProfileOrder(data);
  }

  @Put('/hubber-team-profile/:id')
  async updateProfile(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateHubbersTeamProfileDto,
  ): Promise<any> {
    return this.userService.updateHubberTeamProfile(id.id, data);
  }
}
