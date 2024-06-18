import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import { SelectProfileDto } from 'src/helper/dtos';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Post()
  async createProfile(
    @Body(ValidationPipe) data: SelectProfileDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.profileService.createEmptyProfile(data, user_id);
  }

  @Get()
  async getProfiles(@CurrentUser() user_id: number): Promise<any> {
    return await this.profileService.getUserProfiles(user_id);
  }
}
