import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { CreateCommentDto } from 'src/core/dtos/post/create-comment.dto';
import { CreatePostDto } from 'src/core/dtos/post/create-post.dto';
import { ReportPostDto } from 'src/core/dtos/post/report-post.dto';
import { SharePostDto } from 'src/core/dtos/post/share-post.dto';
import { UpdateCommentDto } from 'src/core/dtos/post/update-comment.dto';
import { UpdatePostDto } from 'src/core/dtos/post/update-post.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { PostsService } from './posts.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostFilterDto } from 'src/core/dtos/post/post-filter.dto';
import { PostCommentLikeDto } from 'src/core/dtos/post/post-comment-like.dto';
import { ReportPostCommentDto } from 'src/core/dtos/post/report-post-comment.dto';
import { PostCommentHideDto } from 'src/core/dtos/post/post-comment-hide.dto';
import { PostHideDto } from 'src/core/dtos/post/post-hide.dto';
import { AllowUnauthorizedRequest } from 'src/core/decorator/allow.unauthorized.decorator';
import { OpenPaginationDto } from 'src/core/dtos/open-pagination.dto';

@ApiTags('Community Post')
@Controller()
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @MessagePattern('add_community_post')
  public async createCommunityPost(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.postService.createPost(null, data, user_id);
  }

  @MessagePattern('update_community_post')
  public async updateCommunityPost(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.postService.updatePost(data.id, null, data, user_id);
  }

  @MessagePattern('get_community_post_by_community_id')
  public async getPostByCommunity(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.postService.getPostByCommunityAdmin(data.id, data);
  }

  @MessagePattern('get_community_post_by_id')
  public async getPostById(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.postService.getPostById(data);
  }

  @MessagePattern('delete_community_post')
  public async deletePostData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.postService.deletePost(data, 0);
  }

  @MessagePattern('create_post')
  public async get_community_by_user_id(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.postService.createPost(null, data, data.created_by);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('community-post')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  async createPost(
    @UploadedFiles() attachments: Array<Express.Multer.File>,
    @Body(ValidationPipe) data: CreatePostDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.createPost(attachments, data, user_id);
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
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.updatePost(id.id, attachments, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('community-post/community/:id')
  async getPostsByCommunity(
    @Param() id: GetByIdDto,
    @Query() status: PostFilterDto,
  ): Promise<any> {
    return await this.postService.getPostByCommunity(id.id, status);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('community-post/:id')
  async getPost(@Param() id: GetByIdDto): Promise<any> {
    return await this.postService.getPostById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('community-post/:id')
  async deletePost(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.deletePost(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('community-post/comment/:id')
  async postComment(
    @Param() id: GetByIdDto,
    @Body() data: CreateCommentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.createComment(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community-post/comment/like/:id')
  async postCommentLike(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: PostCommentLikeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.postCommentLike(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('community-post/comment/:id')
  async updateComment(
    @Param() id: GetByIdDto,
    @Body() data: UpdateCommentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.updateComment(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('community-post/comment/:id')
  async deleteComment(@Param() id: GetByIdDto): Promise<any> {
    return await this.postService.deleteComment(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('community-post/group/comment/:id')
  async postGroupComment(
    @Param() id: GetByIdDto,
    @Body() data: CreateCommentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.createGroupComment(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('community-post/group/comment/:id')
  async updateGroupComment(
    @Param() id: GetByIdDto,
    @Body() data: UpdateCommentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.updateGroupComment(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community-post/group/comment/like/:id')
  async groupPostCommentLike(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: PostCommentLikeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.groupPostCommentLike(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('community-post/group/comment/:id')
  async deleteGroupComment(@Param() id: GetByIdDto): Promise<any> {
    return await this.postService.deleteGroupComment(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('community-post/share-content/:id')
  async shareContent(
    @Param() id: GetByIdDto,
    @Body() data: SharePostDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.shareContent(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('community-post/report/:id')
  async reportCommunity(
    @Body() data: ReportPostDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.reportPost(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('community-post/pin-post/:id')
  async pinCommunityPost(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.pinCommunityPost(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('community-post/pin-post/community/:id')
  async getPinedPost(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.getPinedPost(id.id, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('community-post/pin-post/open/community/by-id')
  async getOpenPinedPost(@Query() id: OpenPaginationDto): Promise<any> {
    return await this.postService.getPinedPost(id.id, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('community-post/unpin-post/:id')
  async unPinPost(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.unPinPost(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('community-post/post-comment/report/:id')
  async reportPostComment(
    @Body() data: ReportPostCommentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.reportPostComment(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community-post/group/comment/hide/:id')
  async groupPostCommentHide(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: PostCommentHideDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.groupPostCommentHide(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community-post/comment/hide/:id')
  async postCommentHide(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: PostCommentHideDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.postCommentHide(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community-post/group/hide/:id')
  async groupPostHide(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: PostHideDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.groupPostHide(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community-post/hide/:id')
  async PostHide(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: PostHideDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.postService.PostHide(id.id, data, user_id);
  }
}
