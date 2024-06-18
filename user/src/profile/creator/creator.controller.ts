import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import { CreatorDto, UpdateCreatorDto } from 'src/helper/dtos';
import { CreatorService } from './creator.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Creator Profile')
@ApiBearerAuth()
@Controller('/profile/creator')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @MessagePattern('update_creator_profile')
  public async updateProfileForAdmin(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.id;
    delete data.id;
    return await this.creatorService.updateProfile(user_id, data);
  }

  @Post()
  async createProfile(
    @Body(ValidationPipe) data: CreatorDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.creatorService.createProfile(user, data);
  }

  @Put()
  async updateProfile(
    @Body(ValidationPipe) data: UpdateCreatorDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.creatorService.updateProfile(user, data);
  }

  @Get()
  async getProfile(@CurrentUser() user: number): Promise<any> {
    return this.creatorService.getProfile(user);
  }
}
