import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  Controller,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  UploadedFiles,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  CreateCommunityDto,
  GetByIdDto,
  PaginationDto,
  UpdateCommunityDto,
} from 'src/helper/dtos';
import { InviteUsersToCommunityDto } from 'src/helper/dtos/invite-users.dto';
import { UpdateUsersToCommunityDto } from 'src/helper/dtos/update-invite-users.dto';
import { GetDataByIdDto } from 'src/helper/dtos/get-data-by-id.dto';
import { CreatePostDto } from 'src/helper/dtos/create-post.dto';
import { UpdatePostDto } from 'src/helper/dtos/update-post.dto';
import { PostFilterDto } from 'src/helper/dtos/post-filter.dto';
import { UpdateArticleDto } from 'src/helper/dtos/update-community-article.dto';
import { CreateArticleDto } from 'src/helper/dtos/create-community-article.dto';
import { GetByIdOptionalDto } from 'src/helper/dtos/get-by-id-optional.dto';
import { PostLocationFilterDto } from 'src/helper/dtos/post-location.dto';

@ApiTags('Admin Community')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Post()
  async createCommunity(
    @UploadedFile() avatar: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCommunityDto,
  ): Promise<any> {
    return await this.communityService.createCommunity(avatar, data);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('/:id')
  async updateCommunity(
    @UploadedFile() avatar: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCommunityDto,
  ): Promise<any> {
    return await this.communityService.updateCommunity(avatar, data, id.id);
  }

  @Get()
  async getAllCommunity(@Query() data: PaginationDto): Promise<any> {
    return await this.communityService.getAllCommunities(data.limit, data.page);
  }

  @Get('/:id')
  async getCommunity(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityService.getCommunity(id.id);
  }

  @Delete('/:id')
  async deleteCommunity(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityService.deleteCommunity(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community/members')
  async inviteUsersToCommunity(
    @Body(ValidationPipe) data: InviteUsersToCommunityDto,
  ): Promise<any> {
    return await this.communityService.inviteUsers(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/community/members/:id')
  async updateCommunityMember(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateUsersToCommunityDto,
  ): Promise<any> {
    return await this.communityService.updateCommunityMember(data, id.id);
  }

  @Get('/members/:id')
  async getCommunityMembersById(
    @Param() id: GetDataByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    return await this.communityService.getCommunityMembersById(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('community-post')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  async createPost(
    @UploadedFiles() attachments: Array<Express.Multer.File>,
    @Body(ValidationPipe) data: CreatePostDto,
  ): Promise<any> {
    return await this.communityService.createPost(attachments, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('community-post/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  async updatePost(
    @Param() id: GetByIdDto,
    @UploadedFiles() attachments: Array<Express.Multer.File>,
    @Body(ValidationPipe) data: UpdatePostDto,
  ): Promise<any> {
    return await this.communityService.updatePost(attachments, data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('community-post/community/:id')
  async getPostsByCommunity(
    @Param() id: GetByIdOptionalDto,
    @Query() status: PostFilterDto,
  ): Promise<any> {
    return await this.communityService.getPostByCommunity(id.id, status);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('community-post/:id')
  async getPost(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityService.getPostById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('community-post/:id')
  async deletePost(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityService.deletePost(id.id);
  }

  @Post('/community-article')
  async createArticle(
    @Body(ValidationPipe) data: CreateArticleDto,
  ): Promise<any> {
    return await this.communityService.createArticle(data);
  }

  @Put('community-article/:id')
  async updateArticle(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateArticleDto,
  ): Promise<any> {
    return await this.communityService.updateArticle(id.id, data);
  }

  @Get('community/community-article/:id')
  async getLocationPostById(
    @Param() id: GetByIdOptionalDto,
    @Query() data: PostLocationFilterDto,
  ): Promise<any> {
    return await this.communityService.getArticlesByCommunity(id.id, data);
  }

  @Get('community-article/:id')
  async getArticleById(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityService.getArticleById(id.id);
  }

  @Delete('community-article/:id')
  async deleteArticle(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityService.deleteArticle(id.id);
  }
}
