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
import { GetByIdDto } from 'src/core/dtos';
import {
  UpdateWorkspaceExpertDTO,
  WorkspaceExpertDTO,
} from 'src/core/dtos/workspace/workspace-expert.dto';
import {
  CreateWorkspaceCardDTO,
  UpdateWorkspaceCardDTO,
} from 'src/core/dtos/workspace/workspace-card.dto';
import {
  CreateWorkspaceMemberDTO,
  UpdateWorkspaceMemberDTO,
} from 'src/core/dtos/workspace/workspace-member.dto';
import {
  CreateWorkspaceDTO,
  UpdateWorkspaceDTO,
} from 'src/core/dtos/workspace/workspace.dto';

import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { WorkspaceService } from './workspace.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WorkspaceFilterDTO } from 'src/core/dtos/workspace/workspace-filter.dto';
import { ProjectFilterDto } from 'src/core/dtos/project-filter.dto';

@ApiTags('Workspace')
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly projectService: WorkspaceService) {}

  @MessagePattern('add_workspace')
  public async createCreateWorkspace(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.projectService.createWorkspace(data, 0);
  }

  @MessagePattern('get_workspace_by_id')
  public async getGetWorkspaceByProjectId(@Payload() id: number): Promise<any> {
    return this.projectService.getWorkspaceByProjectId(id);
  }

  @MessagePattern('get_workspace_by_workspace_id')
  public async getGetWorkspaceById(@Payload() id: number): Promise<any> {
    return this.projectService.getWorkspaceWorkspaceById(id);
  }

  @MessagePattern('add_workspace_member')
  public async createWorkspaceMemberData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.projectService.createWorkspaceMember(data, 0);
  }

  @MessagePattern('invite_workspace_expert')
  public async inviteWorkspaceExpert(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.projectService.inviteExpert(data, 0);
  }

  @MessagePattern('get_invite_expert_by_project_id')
  public async getInviteExpertByProjectId(@Payload() id: number): Promise<any> {
    return this.projectService.getInviteExpertByProjectId(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/experts/:workspace_id')
  async getAllExpert(
    @Param('workspace_id') workspace_id: number,
  ): Promise<any> {
    return await this.projectService.getAllExpertise(workspace_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  async createWorkspace(
    @Body(ValidationPipe) data: CreateWorkspaceDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.createWorkspace(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  async updateWorkspace(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateWorkspaceDTO,
  ): Promise<any> {
    return await this.projectService.updateWorkspace(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-workspace')
  async getAllWorkspace(
    @Query() data: ProjectFilterDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.getAllWorkspace(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getWorkspaceById(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.getWorkspaceById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/project/:id')
  async getWorkspaceByProjectId(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.projectService.getWorkspaceByProjectId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteWorkspace(@Param() data: GetByIdDto): Promise<any> {
    return await this.projectService.deleteWorkspace(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/workspace-card')
  async createWorkspaceCard(
    @Body(ValidationPipe) data: CreateWorkspaceCardDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.createWorkspaceCard(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/workspace-card/:id')
  async updateWorkspaceCard(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateWorkspaceCardDTO,
  ): Promise<any> {
    return await this.projectService.updateWorkspaceCard(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/workspace-card/card-type/:id')
  async getWorkspaceCardByCardType(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.projectService.getWorkspaceCardByCardType(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/workspace-card/:id')
  async deleteWorkspaceCard(@Param() data: GetByIdDto): Promise<any> {
    return await this.projectService.deleteWorkspaceCard(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/workspace-member')
  async createWorkspaceMember(
    @Body(ValidationPipe) data: CreateWorkspaceMemberDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.createWorkspaceMember(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/workspace-member/:id')
  async updateWorkspaceMember(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateWorkspaceMemberDTO,
  ): Promise<any> {
    return await this.projectService.updateWorkspaceMember(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/workspace-meber/workspace/:id')
  async getWorkspaceMemberByWorkspace(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.projectService.getWorkspaceMemberByWorkspace(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/workspace-member/:id')
  async deleteWorkspaceMember(@Param() data: GetByIdDto): Promise<any> {
    return await this.projectService.deleteWorkspaceMember(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/invite/expert')
  async inviteExpert(
    @Body(ValidationPipe) data: WorkspaceExpertDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.inviteExpert(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/invite/expert/:id')
  async updateInviteExpert(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateWorkspaceExpertDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.updateInviteExpert(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/invite/expert/workspace/:id')
  async getInviteExpertByWorkspaceId(
    @Param(ValidationPipe) id: GetByIdDto,
    @Query() data: WorkspaceFilterDTO,
  ): Promise<any> {
    return await this.projectService.getInviteExpertByWorkspaceId(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/invite/expert/:id')
  async deleteInviteExpert(@Param() data: GetByIdDto): Promise<any> {
    return await this.projectService.deleteInviteExpert(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/workspace-card/workspace/:id')
  async getWorkspaceCardByWorkspaceId(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.projectService.getWorkspaceCardByWorkspaceId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category-card/category/:id')
  async getGigCategoryCardByCategoryId(@Param('id') id: number): Promise<any> {
    return this.projectService.getGigCategoryCardByCategoryId(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/workspace-gig/:gig_id')
  async getWorkspaceByGigId(@Param('gig_id') gig_id: number): Promise<any> {
    return await this.projectService.getWorkspaceByGigId(gig_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/invite/expert/:gig_id')
  async getInviteExpertByGigId(
    @Param('gig_id') gig_id: number,
    @Query() data: WorkspaceFilterDTO,
  ): Promise<any> {
    return await this.projectService.getInviteExpertByGigId(gig_id, data);
  }
}
