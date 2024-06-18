import {
  Body,
  Post,
  Put,
  Controller,
  UseGuards,
  ValidationPipe,
  Param,
  Get,
  UploadedFile,
  Delete,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import {
  CreateCommunityGroupDto,
  GetByIdDto,
  UpdateCommunityGroupDto,
  GetGroupByStatus,
  UpdateGroupStatusDto,
} from 'src/helper/dtos';
import { CommunityGroupService } from './community-group.service';
import { SearchDataQueryGroupDto } from 'src/helper/dtos/search-data-query.dto';

@ApiTags('Admin Community Groups')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/community-groups')
export class CommunityGroupController {
  constructor(private readonly communityGroupsService: CommunityGroupService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover_page'))
  async addGroups(
    @UploadedFile() cover_page: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCommunityGroupDto,
  ): Promise<any> {
    return await this.communityGroupsService.addCommunityGroups(
      data,
      cover_page,
    );
  }

  @Put('/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover_page'))
  async updateCommunityUser(
    @UploadedFile() cover_page: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateCommunityGroupDto,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.communityGroupsService.updateGroup(
      id.id,
      data,
      cover_page,
    );
  }

  @Get()
  async getAllGroups(
    @Query() queryParam: SearchDataQueryGroupDto,
  ): Promise<any> {
    return this.communityGroupsService.getAllGroups(queryParam);
  }

  @Get('/:id')
  async getGroup(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityGroupsService.getGroupById(id.id);
  }

  @Get('/community/:id')
  async getGroupsByCommunity(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityGroupsService.getGroupsByCommunity(id.id);
  }

  @Delete('/:id')
  async deleteGroup(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityGroupsService.deleteGroup(id.id);
  }

  @Get('/status/:status')
  async getGroupBySattus(@Param() status: GetGroupByStatus): Promise<any> {
    return await this.communityGroupsService.getGroupByStatus(status);
  }

  @Put('status/:id')
  async updateGroupStatus(
    @Param() id: GetByIdDto,
    @Body() status: UpdateGroupStatusDto,
  ): Promise<any> {
    return await this.communityGroupsService.updateAdminGroupStatus(id, status);
  }
}
