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
import {
  CreateTopicDto,
  GetByIdDto,
  PaginationDto,
  UpdateTopicDto,
  GetTopicByStatus,
} from 'src/helper/dtos';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { CommunityTopicsService } from './community-topics.service';

@ApiTags('Admin Community Topics')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/community-topics')
export class CommunityTopicsController {
  constructor(private readonly communityTopicService: CommunityTopicsService) {}

  @Post()
  async createCommunityTopic(
    @Body(ValidationPipe) data: CreateTopicDto,
  ): Promise<any> {
    return await this.communityTopicService.createCommunityTopic(data);
  }

  @Put('/:id')
  async updateCommunityTopic(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateTopicDto,
  ): Promise<any> {
    return await this.communityTopicService.updateCommunityTopic(data, id.id);
  }

  @Get()
  async getAllCommunityTopics(@Query() data: PaginationDto): Promise<any> {
    return await this.communityTopicService.getAllCommunityTopics(
      data.limit,
      data.page,
    );
  }

  @Get('/:id')
  async getCommunityTopic(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityTopicService.getCommunityTopic(id.id);
  }

  @Delete('/:id')
  async deleteCommunityTopic(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityTopicService.deleteCommunityTopic(id.id);
  }

  @Get('/community/:id')
  async getCommunityTopicByCommunityid(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityTopicService.getCommunityTopicByCommunityid(
      id.id,
    );
  }

  @Get('/status/:status')
  async getGroupBySattus(@Param() status: GetTopicByStatus): Promise<any> {
    return await this.communityTopicService.getTopicByStatus(status);
  }
}
