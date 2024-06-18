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
import { JobService } from './jobs.service';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import {
  CreateJobBasicDTO,
  UpdateJobBasicDTO,
} from 'src/helper/dtos/jobs/job-basic.dto';
import { GetByIdDto, PaginationDto } from 'src/helper/dtos';
import {
  CreateJobProposalDTO,
  UpdateJobProposalDTO,
} from 'src/helper/dtos/jobs/job-proposal.dto';
import { JobProposalFilterDTO } from 'src/helper/dtos/jobs/job-proposal-filter.dto';
import {
  CreateJobSkillDTO,
  UpdateJobSkillDTO,
} from 'src/helper/dtos/jobs/job-skill.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JobFilterDTO } from 'src/helper/dtos/jobs/job-basic-filter.dto';
import {
  CreateUserExpertiseReviewDTO,
  UpdateUserExpertiseReviewDTO,
} from 'src/helper/dtos/jobs/user-expertise-review.dto';

@ApiTags('Jobs')
@Controller('/admin/job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @MessagePattern('get_skill_by_ids')
  public async getSkillByIdsData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.jobService.getSkillByIdsData(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  async createJob(@Body(ValidationPipe) data: CreateJobBasicDTO): Promise<any> {
    return await this.jobService.createJob(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  async updateJob(
    @Body(ValidationPipe) data: UpdateJobBasicDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateJob(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getJobById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  async getAllUserJob(@Query() data: JobFilterDTO): Promise<any> {
    return await this.jobService.getAllUserJobs(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteJobById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.deleteJobById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/proposal')
  async createJobProposal(
    @Body(ValidationPipe) data: CreateJobProposalDTO,
  ): Promise<any> {
    return await this.jobService.createJobProposal(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/proposal/:id')
  async updateJobProposal(
    @Body(ValidationPipe) data: UpdateJobProposalDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateJobProposal(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/proposal/:id')
  async deleteJobProposalById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.deleteJobProposalById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/proposal/:id')
  async getJobProposalById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobProposalById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/proposal/job/:id')
  async getJobProposalByJobId(
    @Param() id: GetByIdDto,
    @Query() data: JobProposalFilterDTO,
  ): Promise<any> {
    return await this.jobService.getJobProposalByJobId(id.id, data.filter);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/user-expertise-review')
  async createJobProposalReview(
    @Body(ValidationPipe) data: CreateUserExpertiseReviewDTO,
  ): Promise<any> {
    return await this.jobService.createJobProposalReview(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/user-expertise-review/:id')
  async updateJobProposalReview(
    @Body(ValidationPipe) data: UpdateUserExpertiseReviewDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateJobProposalReview(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/user-expertise-review/:id')
  async deleteJobProposalReviewById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.deleteJobProposalReviewById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise-review/:id')
  async getJobProposalReviewById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobProposalReviewById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all/user-expertise-review')
  async getAllProposalReview(@Query() data: PaginationDto): Promise<any> {
    return await this.jobService.getAllProposalReview(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/skill')
  async createJobSkill(
    @Body(ValidationPipe) data: CreateJobSkillDTO,
  ): Promise<any> {
    return await this.jobService.createJobSkill(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/skill/:id')
  async updateJobSkill(
    @Body(ValidationPipe) data: UpdateJobSkillDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateJobSkill(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('all-job/skill')
  async getAllJobSkill(
    @Query(ValidationPipe) data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.jobService.getAllJobSkill(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/skill/:id')
  async getJobSkillById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobSkillById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/skill/:id')
  async deleteJobSkill(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.deleteJobSkill(id.id);
  }
}
