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
import { AllowUnauthorizedRequest } from 'src/core/decorator/allow.unauthorized.decorator';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import {
  CreateProjectBasicDTO,
  GetByIdDto,
  ProjectMemberDto,
  SearchDataDto,
  UpdateProjectBasicDTO,
} from 'src/core/dtos';
import { AssessmentDto } from 'src/core/dtos/project-assessment.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { ProjectService } from './project.service';
import { ProjectFilterDto } from 'src/core/dtos/project-filter.dto';

@ApiTags('Project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @MessagePattern('add_project')
  public async createProjectData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.projectService.createProject(data, data.project_image, user_id);
  }

  @MessagePattern('update_project')
  public async updateProjectData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return await this.projectService.updateProject(data.id, data, '', user_id);
  }

  @MessagePattern('get_all_project')
  public async getAllProjectData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.projectService.getAllProject(data, 0);
  }

  @MessagePattern('get_project_by_id')
  public async getProjectByIdData(@Payload() id: number): Promise<any> {
    return this.projectService.getProjectById(id);
  }

  @MessagePattern('delete_project')
  public async deleteProjectData(@Payload() id: number): Promise<any> {
    return this.projectService.deleteProject(id, 0);
  }

  @MessagePattern('add_assessment')
  public async addProjectAssessmentData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.projectService.createProjectAssessment(data, 0);
  }

  @MessagePattern('get_project_assessment_by_project_id')
  public async getProjectAssessmentByIdData(
    @Payload() id: number,
  ): Promise<any> {
    return this.projectService.getProjectAssessmentByProjectId(id, 0);
  }

  @MessagePattern('get_project_assessment_by_subcategory_id')
  public async getProjectAssessmentBySubCategoryIdData(
    @Payload() id: number,
  ): Promise<any> {
    return this.projectService.getProjectAssessmentBySubCategoryId(id, 0);
  }

  @MessagePattern('get_project_assessment_by_category_id')
  public async getProjectAssessmentByCategoryIdData(
    @Payload() id: number,
  ): Promise<any> {
    return this.projectService.getProjectAssessmentByCategoryId(id, 0);
  }

  @MessagePattern('add_project_member')
  public async addProjectMemberData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.projectService.createProjectMember(data, 0);
  }

  @MessagePattern('get_project_member_by_project_id')
  public async getProjectMemberByProjectIdData(
    @Payload() id: number,
  ): Promise<any> {
    return this.projectService.getProjectMemberByProjectId(id);
  }

  @MessagePattern('delete_project_member')
  public async deleteProjectMemberData(@Payload() id: number): Promise<any> {
    return this.projectService.deleteProjectMember(id, 0);
  }

  @MessagePattern('get_project_member_by_id')
  public async getGetProjectMemberById(@Payload() id: number): Promise<any> {
    return this.projectService.getProjectMemberById(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('project_image'))
  async createProject(
    @UploadedFile() project_image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateProjectBasicDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.createProject(
      data,
      project_image,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('project_image'))
  async updateProject(
    @Param() id: GetByIdDto,
    @UploadedFile() project_image: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateProjectBasicDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.updateProject(
      id.id,
      data,
      project_image,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-project')
  async getAllProject(
    @Query(ValidationPipe) data: ProjectFilterDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.getAllProject(data, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/search')
  async searchProject(
    @Query(ValidationPipe) data: SearchDataDto,
  ): Promise<any> {
    return await this.projectService.searchOpenProject(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getProjectById(@Param(ValidationPipe) id: GetByIdDto): Promise<any> {
    return await this.projectService.getProjectById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteProject(
    @Param() data: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.deleteProject(data.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/assessment')
  async addProjectAssessment(
    @Body() data: AssessmentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.createProjectAssessment(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('assessment/project/:id')
  async getProjectAssessmentByProjectId(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.getProjectAssessmentByProjectId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('assessment/category/:id')
  async getProjectAssessmentByCategoryId(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.getProjectAssessmentByCategoryId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('assessment/sub-category/:id')
  async getProjectAssessmentBySubCategoryId(
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.getProjectAssessmentBySubCategoryId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/project-member')
  async addProjectMember(
    @Body() data: ProjectMemberDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.projectService.createProjectMember(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/project-member/:id')
  async getProjectMemberById(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.projectService.getProjectMemberById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/project-member/project/:id')
  async getProjectMemberByProjectId(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.projectService.getProjectMemberByProjectId(id.id);
  }
}
