import {
  Controller,
  UseGuards,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommunityMembersService } from './community-members.service';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { GetByIdDto, PaginationDto } from 'src/helper/dtos';

@ApiTags('Admin Community Members')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/community-members')
export class CommunityMembersController {
  constructor(
    private readonly communityMemberService: CommunityMembersService,
  ) {}

  @Get()
  async getAllCommunityUsers(@Query() data: PaginationDto): Promise<any> {
    return await this.communityMemberService.getAllCommunityUsers(
      data.limit,
      data.page,
    );
  }

  @Get('/:id')
  async getCommunityMember(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityMemberService.getCommunityMember(id.id);
  }

  @Delete('/:id')
  async deleteCommunityMember(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityMemberService.deleteCommunityMember(id.id);
  }
}
