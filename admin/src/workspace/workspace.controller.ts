import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetByIdDto } from 'src/helper/dtos';
import {
  CreateWorkspaceTypeDto,
  UpdateWorkspaceTypeDto,
} from 'src/helper/dtos/workspace/workspace-type.dto';
import {
  CreateWorkspaceCardTypeDto,
  UpdateWorkspaceCardTypeDto,
} from 'src/helper/dtos/workspace/workspace-card-type.dto';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { WorkspaceService } from './workspace.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateWorkspaceDTO } from '../helper/dtos/workspace/workspace.dto';
import { CreateWorkspaceMemberDTO } from 'src/helper/dtos/workspace/workspace-member.dto';
import { WorkspaceExpertDTO } from 'src/helper/dtos/workspace/workspace-expert.dto';

@ApiTags('Workspace')
@Controller('/admin/workspace')
export class WorkspaceController {
  constructor(private readonly marketPlaceService: WorkspaceService) {}

  @MessagePattern('get_workspace_category_by_id')
  public async get_workspace_category_by_id(
    @Payload() id: number,
  ): Promise<any> {
    return this.marketPlaceService.getWorkspaceCategoryById(id);
  }

  @MessagePattern('get_workspace_card_type_by_id')
  public async get_workspace_card_type_by_id(
    @Payload() id: number,
  ): Promise<any> {
    return this.marketPlaceService.getWorkspaceCardTypeById(id);
  }

  @MessagePattern('get_workspace_card_type_by_category_id')
  public async get_workspace_card_type_by_category_id(
    @Payload() id: number,
  ): Promise<any> {
    return this.marketPlaceService.getGigCategoryCardByCategoryId(id);
  }

  // CANVAS TYPE
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/category')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateWorkspaceTypeDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'icon', maxCount: 1 },
      { name: 'co_created_with', maxCount: 1 },
    ]),
  )
  async createCategory(
    @UploadedFiles()
    files: {
      icon?: Express.Multer.File;
      co_created_with?: Express.Multer.File;
    },
    @Body(ValidationPipe) data: CreateWorkspaceTypeDto,
  ): Promise<any> {
    let co_created_with;
    if (files.co_created_with) {
      co_created_with = files.co_created_with[0];
    }
    return await this.marketPlaceService.createWorkspaceCategory(
      data,
      files.icon[0],
      co_created_with,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/category/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'icon', maxCount: 1 },
      { name: 'co_created_with', maxCount: 1 },
    ]),
  )
  async updateGigCategory(
    @UploadedFiles()
    files: {
      icon?: Express.Multer.File;
      co_created_with?: Express.Multer.File;
    },
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateWorkspaceTypeDto,
  ): Promise<any> {
    let co_created_with;
    if (files.co_created_with) {
      co_created_with = files.co_created_with[0];
    }

    let icon;
    if (files.icon) {
      icon = files.icon[0];
    }
    return this.marketPlaceService.updateWorkspaceCategory(
      id.id,
      data,
      icon,
      co_created_with,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category/:id')
  async getGigCategoryById(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.getWorkspaceCategoryById(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category')
  async getGigAllCategory(): Promise<any> {
    return this.marketPlaceService.getWorkspaceCategory();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/category/:id')
  async deleteGigCategory(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.deleteWorkspaceCategory(id);
  }

  // CANVAS TYPE CARD TYPE

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/category-card')
  async createCategoryCard(
    @Body(ValidationPipe) data: CreateWorkspaceCardTypeDto,
  ): Promise<any> {
    return await this.marketPlaceService.createWorkspaceCardType(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/category-card/:id')
  async updateGigCategoryCard(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateWorkspaceCardTypeDto,
  ): Promise<any> {
    return this.marketPlaceService.updateWorkspaceCardType(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category-card/category/:id')
  async getGigCategoryCardByCategoryId(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.getGigCategoryCardByCategoryId(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category-card/:id')
  async getGigCategoryCardById(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.getWorkspaceCardTypeById(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category-card')
  async getGigAllCategoryCard(): Promise<any> {
    return this.marketPlaceService.getWorkspaceCardType();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/category-card/:id')
  async deleteGigCategoryCard(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.deleteWorkspaceCardType(id);
  }

  // WORKSPACE

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  async createWorkspace(
    @Body(ValidationPipe) data: CreateWorkspaceDTO,
  ): Promise<any> {
    return await this.marketPlaceService.createWorkspace(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/project/:id')
  async getWorkspaceByProjectId(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.marketPlaceService.getWorkspaceByProjectId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/workspace-member')
  async createWorkspaceMember(
    @Body(ValidationPipe) data: CreateWorkspaceMemberDTO,
  ): Promise<any> {
    return await this.marketPlaceService.createWorkspaceMember(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/invite/expert')
  async inviteExpert(
    @Body(ValidationPipe) data: WorkspaceExpertDTO,
  ): Promise<any> {
    return await this.marketPlaceService.inviteExpert(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/invite/expert/project/:id')
  async getInviteExpertByProjectId(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.marketPlaceService.getInviteExpertByProjectId(id.id);
  }
}
