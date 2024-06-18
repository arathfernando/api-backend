import {
  Body,
  Controller,
  Delete,
  Get,
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
  UpdateHubbersTeamProfileDto,
  HubbersTeamProfileDto,
} from 'src/helper/dtos';
import { HubbersTeamService } from './hubbers-team.service';

@ApiTags('Hubbers Team Profile')
@ApiBearerAuth()
@Controller('/profile/hubbers-team')
export class HubbersTeamController {
  constructor(private hubbersTeamService: HubbersTeamService) {}

  @MessagePattern('create_hubber_team_profile')
  public async createHubberProfile(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.hubbersTeamService.createAdminHubberTeamProfile(data);
  }

  @MessagePattern('remove_hubber_profile')
  public async removeHubberProfile(@Payload() data: any): Promise<any> {
    return this.hubbersTeamService.removeHubberProfile(data);
  }

  @MessagePattern('update_hubber_team_profile')
  public async updateHubberProfile(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const id = data.id;
    delete data.id;
    return this.hubbersTeamService.updateAdminHubberTeamProfile(id, data.data);
  }

  @MessagePattern('get_hubber_team_profile')
  public async getHubberProfile(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.hubbersTeamService.getAdminHubberTeamProfile(data);
  }

  @MessagePattern('update_hubber_team_profile_order')
  public async updateHubberProfileOrder(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.hubbersTeamService.updateAdminHubberTeamProfileOrder(data);
  }

  @MessagePattern('update_hubber_team_profile')
  public async updateHubberTeamProfile(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.id;
    delete data.id;
    return await this.hubbersTeamService.updateProfile(null, data, user_id);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Post()
  async createProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body(ValidationPipe) data: HubbersTeamProfileDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.hubbersTeamService.createProfile(avatar, user_id, data);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Put()
  async updateProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateHubbersTeamProfileDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.hubbersTeamService.updateProfile(avatar, data, user_id);
  }

  @Get()
  async getProfile(@CurrentUser() user_id: number): Promise<any> {
    return this.hubbersTeamService.getProfile(user_id);
  }

  @Delete()
  async removeHubberTeamProfile(@CurrentUser() user_id: number): Promise<any> {
    return this.hubbersTeamService.removeHubberProfile(user_id);
  }
}
