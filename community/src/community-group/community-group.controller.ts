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
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { AllowGroupDto } from 'src/core/dtos/community-group/allow-in-group.dto';
import { CreateCommunityGroupDto } from 'src/core/dtos/community-group/create-community-group.dto';
import { StatusGroupMemberDto } from 'src/core/dtos/community-group/group-member-status.dto';
import { UpdateCommunityGroupDto } from 'src/core/dtos/community-group/update-community-group.dto';
import { GroupTypeDto } from 'src/core/dtos/community-group/group-type.dto';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { ICommunityGroup } from 'src/core/interfaces/ICommunityGroup';
import { CommunityGroupService } from './community-group.service';
import { SearchDataDto } from 'src/core/dtos/community-group/search-data.dto';
import { JoinInvitedGroupDto } from 'src/core/dtos/community-group/join-invited-group.dto';
import { SearchDataQueryGroupDto } from 'src/core/dtos/community-group/search-data-query.dto';
import { LeaveGroupDto } from 'src/core/dtos/community-group/leave-group.dto';
import { ReportGroupDto } from 'src/core/dtos/community-group/report-group.dto';
import { InviteUsersToGroupDto } from 'src/core/dtos/community-group/invite-users.dto';
import { RemoveGroupMemberDto } from 'src/core/dtos/community-group/remove-group-member.dto';
import { UpdateInviteUsersToGroupDto } from 'src/core/dtos/community-group/update-invite-users.dto';

@ApiTags('Community Group')
@Controller('community-group')
export class CommunityGroupController {
  constructor(private readonly communityGroupService: CommunityGroupService) {}

  @MessagePattern('get_all_group')
  public async getAllGroups(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityGroupService.getGroups(data, 0);
  }

  @MessagePattern('get_groups_by_community')
  public async getGroupsByCommunity(@Payload() data: any): Promise<any> {
    return this.communityGroupService.getGroupByCommunityId(data, 0);
  }
  @MessagePattern('change_group_status')
  public async change_group_status(@Payload() data: any): Promise<any> {
    return this.communityGroupService.changeGroupStatusAdmin(data, 0);
  }

  @MessagePattern('create_community_group')
  public async createGroup(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityGroupService.createGroup(
      data,
      data.cover_page,
      data.user_id,
    );
  }

  @MessagePattern('get_group_by_id')
  public async getGroupsById(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityGroupService.getGroupByIdAdmin(data);
  }

  @MessagePattern('update_group')
  public async update_group(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityGroupService.updateGroupAdmin(data);
  }

  @MessagePattern('delete_group')
  public async delete_group(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityGroupService.deleteGroupAdmin(data);
  }

  @MessagePattern('get_groups_by_status')
  public async get_group_by_status(@Payload() status: any): Promise<any> {
    return this.communityGroupService.getAdminGroupByStatus(status);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover_page'))
  async createCommunityGroup(
    @UploadedFile() cover_page: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCommunityGroupDto,
    @CurrentUser() user_id: number,
  ): Promise<ICommunityGroup | any> {
    return await this.communityGroupService.createGroup(
      data,
      cover_page,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover_page'))
  @Put('/:id')
  async updateCommunityGroup(
    @Param() id: GetByIdDto,
    @UploadedFile() cover_page: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateCommunityGroupDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityGroupService.updateGroup(
      id,
      data,
      cover_page,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  async getCommunityGroups(
    @Query() queryParam: SearchDataQueryGroupDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityGroupService.getGroups(queryParam, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/search/:search')
  async searchCommunityGroup(
    @Param() search: SearchDataDto,
    @Query() queryParam: SearchDataQueryGroupDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityGroupService.searchGroup(search, queryParam, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getGroupById(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityGroupService.getGroupById(id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/members/:id')
  async getGroupMembers(
    @Param() id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    return this.communityGroupService.getGroupMembers(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/topic/:id')
  async getGroupTopics(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityGroupService.getGroupTopics(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/:id')
  async getGroupByCommunityId(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityGroupService.getGroupByCommunityId(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteGroup(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityGroupService.deleteGroup(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/allow')
  async communityAllow(@Body() data: AllowGroupDto): Promise<any> {
    return await this.communityGroupService.groupAllow(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/member/status/:id/:status')
  async joinedUserStatus(@Param() status: StatusGroupMemberDto): Promise<any> {
    return await this.communityGroupService.joinedUserStatus(status);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/group-type/:group_type')
  async groupsByType(
    @Param() group_type: GroupTypeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.groupsByType(group_type, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/join/group')
  async joinInvitedGroup(
    @Body(ValidationPipe) data: JoinInvitedGroupDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.joinInvitedGroup(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/group/activity')
  async getGroupActivity(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.communityGroupService.getGroupActivity(newD, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/group-activity/:id')
  async getGroupActivityById(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.getGroupActivityById(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/leave/:id')
  async leaveCommunity(
    @Body() data: LeaveGroupDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.leaveGroup(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/report/:id')
  async reportGroup(
    @Body() data: ReportGroupDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.reportGroup(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/invite/group')
  async inviteUsersToGroup(
    @Body(ValidationPipe) data: InviteUsersToGroupDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.inviteUsers(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/invite/group/:id')
  async updateInviteUsersToGroup(
    @Body(ValidationPipe) data: UpdateInviteUsersToGroupDto,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.communityGroupService.updateInviteUsersToGroup(
      id.id,
      data,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/remove/:id')
  async removeCommunityMember(
    @Body() data: RemoveGroupMemberDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.removeCommunityMember(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/user/remove/:id')
  async removeGroupUser(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.removeGroupUser(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/group/join/:id')
  async joinGroup(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityGroupService.joinGroup(id.id, user_id);
  }
  // @ApiBearerAuth()
  // @UseGuards(ClientAuthGuard)
  // @Post('/member/search')
  // async communityMemberSearch(
  //   @Query() data: SearchCommunityUserDto,
  // ): Promise<ICommunity[]> {
  //   return await this.communityService.communityMemberSearch(data);
  // }
}
