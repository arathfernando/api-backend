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
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { CreateArticleDto } from 'src/core/dtos/community-article/create-community-article.dto';
import { UpdateArticleDto } from 'src/core/dtos/community-article/update-community-article.dto';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { CommunityArticleService } from './community-article.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Community Article')
@Controller('community-article')
export class CommunityArticleController {
  constructor(
    private readonly communityArticleService: CommunityArticleService,
  ) {}

  @MessagePattern('add_community_article')
  public async createCommunityArticle(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.communityArticleService.createArticle(data, user_id);
  }

  @MessagePattern('update_community_article')
  public async updateCommunityArticle(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.communityArticleService.updateArticle(data.id, data, user_id);
  }
  @MessagePattern('get_community_article_by_community_id')
  public async getArticlesByCommunity(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityArticleService.getArticlesByCommunityAdmin(
      data.id,
      data,
    );
  }
  @MessagePattern('get_community_article_by_id')
  public async getArticleByIdData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityArticleService.getArticleById(data.id);
  }
  @MessagePattern('delete_community_article')
  public async deleteArticleData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityArticleService.deleteArticle(data, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  async createArticle(
    @Body(ValidationPipe) data: CreateArticleDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityArticleService.createArticle(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  async updateArticle(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateArticleDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityArticleService.updateArticle(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/:id')
  async getLocationPostById(
    @Param() id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    return await this.communityArticleService.getArticlesByCommunity(
      id.id,
      data.limit,
      data.page,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getArticleById(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityArticleService.getArticleById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteArticle(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityArticleService.deleteArticle(id.id, user_id);
  }
}
