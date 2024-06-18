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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import {
  CreateTopicDto,
  GetTopicDto,
  GetTopicLikesDto,
  TopicFollowReactionDto,
  UpdateTopicDto,
} from 'src/core/dtos/topic';
import { TopicFollowDto } from 'src/core/dtos/topic/topic-follow.dto';
import { TopicReactionDto } from 'src/core/dtos/topic/topicreaction.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { CurrentUser } from '../core/decorator/user.decorator';
import {
  CommunitySearchDto,
  CreateCommunityDto,
  InviteUsersToCommunityDto,
  JoinCommunityDto,
  JoinInvitedCommunityDto,
  UpdateCommunityDto,
  StatusCommunityDto,
  AllowCommunityDto,
  StatusCommunityMemberDto,
  AssignTopicDto,
  CreateTopicAssignDto,
  SearchCommunityUserDto,
  LeaveCommunityDto,
  ReportCommunityDto,
  RemoveCommunityMemberDto,
  CommunityMaxRangeDto,
  CommunityAdvanceSearchDto,
} from '../core/dtos/community';
import { ICommunity } from '../core/interfaces/ICommunity';
import { CommunityService } from './community.service';
import { CommunityRequestDto } from 'src/core/dtos/community/community-request.dto';
import { UpdateCommunityRequestDto } from 'src/core/dtos/community/community-request.dto copy';
import { GetByIdOptionalDto } from 'src/core/dtos/community/get-by-id-optional.dto';
import { UpdateUsersToCommunityDto } from 'src/core/dtos/topic/update-invite-users.dto';
import { AllowUnauthorizedRequest } from 'src/core/decorator/allow.unauthorized.decorator';
import { OpenPaginationDto } from 'src/core/dtos/open-pagination.dto';

@ApiTags('Community')
@Controller()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @MessagePattern('add_community')
  public async createCommunityData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityService.createCommunity(data, null, data.created_by);
  }

  @MessagePattern('update_community')
  public async updateCommunityData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityService.updateCommunity(
      data.id,
      data,
      data.created_by,
      null,
    );
  }

  @MessagePattern('get_all_community_users')
  public async allCommunityMembersData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityService.allCommunityMembersData(data);
  }

  @MessagePattern('get_all_communities')
  public async allCommunityData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityService.getAllCommunities(data, 0);
  }

  @MessagePattern('invite_community_members')
  public async inviteMemberToCommunityData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.communityService.inviteMember(data, user_id, true);
  }

  @MessagePattern('update_community_member')
  public async updateCommunityMemberData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityService.updateCommunityMember(data.id, data);
  }

  @MessagePattern('get_community_member_by_id')
  public async getCommunityMemberDataById(
    @Payload() data: { userId: number },
  ): Promise<any> {
    return this.communityService.getCommunityMemberDataById(data.userId);
  }

  @MessagePattern('get_community_by_id')
  public async getCommunityDataById(@Payload() data: any): Promise<any> {
    return this.communityService.getSingleCommunity(data, 0);
  }

  @MessagePattern('get_community')
  public async getCommunityById(@Payload() id: any): Promise<any> {
    return this.communityService.getCommunityById(id);
  }

  @MessagePattern('get_community_by_id_investor')
  public async getCommunityDataByIdInvestor(
    @Payload() data: any,
  ): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.user_id;
    return this.communityService.getSingleCommunityForInvestor(
      data.id,
      user_id,
    );
  }

  @MessagePattern('delete_community_member')
  public async deleteMember(@Payload() data: { userId: number }): Promise<any> {
    return this.communityService.deleteCommunityMember(data.userId);
  }

  @MessagePattern('delete_community')
  public async deleteUser(@Payload() data: any): Promise<any> {
    return this.communityService.deleteAnyCommunity(data);
  }

  @MessagePattern('add_community_topic')
  public async createCommunityTopicData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.communityService.createTopic(data, user_id);
  }

  @MessagePattern('update_community_topic')
  public async updateCommunityTopicData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityService.updateTopic(data.id, data);
  }

  @MessagePattern('get_all_community_topics')
  public async allCommunityTopicData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityService.getAllTopics(data, 0);
  }

  @MessagePattern('get_community_topic_by_id')
  public async getCommunityTopicById(@Payload() id: any): Promise<any> {
    return this.communityService.getTopic(id, 0);
  }

  @MessagePattern('delete_community_topic')
  public async deleteTopicData(@Payload() id: any): Promise<any> {
    return this.communityService.deleteTopic(id);
  }

  @MessagePattern('get_members_by_community')
  public async getMembersByCommunity(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityService.getAllCommunityMembers(data.id, data.data, 0);
  }

  @MessagePattern('get_community_topic_by_community_id')
  public async getCommunityTopicByCommunity(@Payload() id: any): Promise<any> {
    return this.communityService.getTopicByCommunity(id, 0);
  }

  @MessagePattern('get_topics_by_status')
  public async get_topics_by_status(@Payload() status: any): Promise<any> {
    return this.communityService.getAdminTopicByStatus(status);
  }

  @MessagePattern('get_community_host')
  public async get_community_host(): Promise<any> {
    return this.communityService.getCommunityHost();
  }

  @MessagePattern('get_community_by_user_id')
  public async get_community_by_user_id(
    @Payload() user_id: number,
  ): Promise<any> {
    return this.communityService.joinedUserCommunity(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  async createCommunity(
    @UploadedFile() avatar: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCommunityDto,
    @CurrentUser() user_id: number,
  ): Promise<ICommunity | any> {
    return await this.communityService.createCommunity(data, avatar, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community/join/:id')
  async joinCommunity(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.joinCommunity(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community/join')
  async joinCommunities(
    @Body() data: JoinCommunityDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.joinCommunities(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/community/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateCommunity(
    @Param() id: GetByIdDto,
    @UploadedFile() avatar: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateCommunityDto,
    @CurrentUser() user_id: number,
  ): Promise<ICommunity> {
    return await this.communityService.updateCommunity(
      id.id,
      data,
      user_id,
      avatar,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/search/:name')
  async searchCommunity(
    @Param(ValidationPipe) name: CommunitySearchDto,
    @CurrentUser() user_id: number,
  ): Promise<ICommunity[]> {
    return await this.communityService.searchCommunity(name, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/advance-search/')
  async advanceSearchCommunity(
    @Query(ValidationPipe) data: CommunityAdvanceSearchDto,
    @CurrentUser() user_id: number,
  ): Promise<ICommunity[]> {
    return await this.communityService.advanceSearchCommunity(data, user_id);
  }

  @Get('/community/open/advance-search')
  async advanceSearchOpenCommunity(
    @Query(ValidationPipe) data: CommunityAdvanceSearchDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.advanceSearchCommunity(data, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/partner/:id')
  async getCommunityPartners(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.getCommunityPartners(id.id);
  }

  @AllowUnauthorizedRequest()
  @Get('/community/partner/open/by-id')
  async getOpenCommunityPartners(@Query() id: GetByIdDto): Promise<any[]> {
    return await this.communityService.getCommunityPartners(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/search/district/:name')
  async searchCommunityByDistrict(
    @Param(ValidationPipe) name: CommunitySearchDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.searchCommunityByDistrict(name);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community')
  async getAllCommunity(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<ICommunity[]> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.communityService.getAllCommunities(newD, user_id);
  }

  @Get('/community/open')
  async getAllOpenCommunity(
    @Query() data: PaginationDto,
  ): Promise<ICommunity[]> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.communityService.getOpenAllCommunities(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community-members/:id')
  async getAllCommunityMembers(
    @Param() id: GetByIdDto,
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.getAllCommunityMembers(
      id.id,
      data,
      user_id,
    );
  }

  @AllowUnauthorizedRequest()
  @Get('/community-members/open/by-id')
  async getOpenAllCommunityMembers(
    @Query() data: OpenPaginationDto,
  ): Promise<any> {
    return await this.communityService.getAllCommunityMembers(data.id, data, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/community-member/remove/:id')
  async removeCommunityMember(
    @Body() data: RemoveCommunityMemberDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.removeCommunityMember(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/community-request')
  async getCommunityRequestData(
    @Query() data: CommunityRequestDto,
  ): Promise<any> {
    return await this.communityService.getCommunityRequestFilter(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/community/community-request/:id')
  async updateCommunityRequest(
    @Param() id: GetByIdDto,
    @Body() data: UpdateCommunityRequestDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.updateCommunityRequest(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/:id')
  async getSingleCommunity(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<ICommunity> {
    return await this.communityService.getSingleCommunity(id.id, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/community/open/by-id')
  async getOpenSingleCommunity(@Query() id: GetByIdDto): Promise<any> {
    return await this.communityService.getSingleCommunity(id.id, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/community/:id')
  async deleteCommunity(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.deleteCommunity(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community-topic')
  async createTopic(
    @Body(ValidationPipe) data: CreateTopicDto,
    @CurrentUser() user_id: number,
  ): Promise<CreateTopicDto> {
    return await this.communityService.createTopic(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/topic/reaction/:id')
  async topicReaction(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: TopicReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.topicReaction(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community-topic/topic/:reaction_type')
  async getTopicByReaction(
    @Param() reaction: TopicReactionDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.getTopicByReaction(reaction);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/topic/follow-reaction/:id')
  async topicFollowReaction(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: TopicFollowReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.topicFollowReaction(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community-topic/follow/:reaction_type')
  async getTopicByFollowReaction(
    @Param() reaction: TopicFollowReactionDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.getTopicByFollowReaction(reaction);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community-topic/topic-follow')
  async getAllFollowTopics(@Query() data: TopicFollowDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.communityService.getAllFollowTopics(
      newD,
      data.reaction_type,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/community-topic/:id')
  async updateTopic(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateTopicDto,
  ): Promise<GetTopicDto> {
    return await this.communityService.updateTopic(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community-topic')
  async getAllTopics(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };

    return await this.communityService.getAllTopics(newD, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community-topic/:id')
  async getTopic(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<GetTopicDto> {
    return await this.communityService.getTopic(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community-topic/community/:id')
  async getTopicByCommunity(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<GetTopicDto> {
    return await this.communityService.getTopicByCommunity(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/assign-community-topic')
  async assignTopic(@Body(ValidationPipe) data: AssignTopicDto): Promise<any> {
    return await this.communityService.assignTopic(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/create-topic-assign')
  async createTopicAssign(
    @Body(ValidationPipe) data: CreateTopicAssignDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.createTopicAssign(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/community-topic/:id')
  async deleteTopic(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityService.deleteTopic(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/invite/community')
  async inviteUsersToCommunity(
    @Body(ValidationPipe) data: InviteUsersToCommunityDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.inviteUsers(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/join/community')
  async joinInvitedCommunity(
    @Body(ValidationPipe) data: JoinInvitedCommunityDto,
  ): Promise<CreateTopicDto> {
    return await this.communityService.joinInvitedCommunity(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/joined/community/:user_id')
  async joinedUserCommunity(
    @Param() id: GetByIdOptionalDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.joinedUserCommunity(id.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/member/status/:id/:status')
  async joinedUserStatus(
    @Param() status: StatusCommunityMemberDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.joinedUserStatus(status);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/status/:status')
  async getCommunityByStatus(
    @Param() status: StatusCommunityDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.getCommunityByStatus(status);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community/allow')
  async communityAllow(@Body() data: AllowCommunityDto): Promise<ICommunity[]> {
    return await this.communityService.communityAllow(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/member/search')
  async communityMemberSearch(
    @Query() data: SearchCommunityUserDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.communityMemberSearch(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community/leave/:id')
  async leaveCommunity(
    @Body() data: LeaveCommunityDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.leaveCommunity(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community/report/:id')
  async reportCommunity(
    @Body() data: ReportCommunityDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityService.reportCommunity(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/community/max-range')
  async getCommunityMaxRange(
    @Body() data: CommunityMaxRangeDto,
  ): Promise<ICommunity[]> {
    return await this.communityService.getCommunityMaxRange(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community-trending-topic')
  async getTrendingTopics(@CurrentUser() user_id: number): Promise<any> {
    return await this.communityService.getTrendingTopics(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/topics-likes')
  async getLikesByTopic(@Query() data: GetTopicLikesDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.communityService.getTopicsLikes(
      data.id,
      newD,
      data.reaction_type,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/community/members/:id')
  async updateCommunityMember(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateUsersToCommunityDto,
  ): Promise<any> {
    return await this.communityService.updateCommunityMember(id.id, data);
  }
}
