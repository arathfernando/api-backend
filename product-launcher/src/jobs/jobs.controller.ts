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
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { JobService } from './jobs.service';
import {
  CreateJobBasicDTO,
  UpdateJobBasicDTO,
} from 'src/core/dtos/jobs/job-basic.dto';
import { GetByIdDto, SearchDataDto } from 'src/core/dtos';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateJobProposalDTO,
  UpdateJobProposalDTO,
} from 'src/core/dtos/jobs/job-proposal.dto';
import { JobProposalFilterDTO } from 'src/core/dtos/jobs/job-proposal-filter.dto';
import {
  CreateJobReactionDto,
  UpdateJobReactionDto,
} from 'src/core/dtos/jobs/job-reaction.dto';
import {
  CreateUserExpertiseReviewDTO,
  UpdateUserExpertiseReviewDTO,
} from 'src/core/dtos/jobs/user-expertise-review.dto';
import { JobFilterDTO } from 'src/core/dtos/jobs/job-basic-filter.dto';
import {
  CreateUserExpertiseProposalDTO,
  UpdateUserExpertiseProposalDTO,
} from 'src/core/dtos/jobs/user-experties-proposal.dto';
import {
  CreateJobProposalReplyDTO,
  UpdateJobProposalReplyDTO,
} from 'src/core/dtos/jobs/job-proposal-reply.dto';
import {
  CreateUserExpertiseProposalReplyDTO,
  UpdateUserExpertiseProposalReplyDTO,
} from 'src/core/dtos/jobs/user-expertise-proposal-reply.dto';
import { JobALLFilterDTO } from 'src/core/dtos/jobs/job-all-filter.dto';
import {
  CreateUserExpertiseReviewReactionDto,
  UpdateUserExpertiseReviewReactionDto,
} from 'src/core/dtos/jobs/user-expertise-review-reaction.dto';
import {
  CreateJobFilesDTO,
  UpdateJobFilesDTO,
} from 'src/core/dtos/jobs/job-files.dto';
import { CreateJobProposalPaymentDTO } from 'src/core/dtos/jobs/job-proposal-payment.dto';
import {
  CreateUserExpertiseReviewReplyDTO,
  UpdateUserExpertiseReviewReplyDTO,
} from 'src/core/dtos/jobs/user-expertise-review-reply.dto';
import { FILE_UPLOAD_BY } from 'src/core/constant/enum.constant';
import { ProposalJobStatusDto } from 'src/core/dtos/jobs/proposal-job-status.dto';
import {
  CreateJobProposalBillingSettingDTO,
  UpdateJobProposalBillingSettingDTO,
} from 'src/core/dtos/jobs/job-proposal-billing-settings.dto';
import {
  UpdateUserExpertiseReportDto,
  createUserExpertiseReportDto,
} from 'src/core/dtos/jobs/user-expertise-report.dto';

@ApiTags('Jobs')
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @MessagePattern('add_job')
  public async createProjectData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.jobService.createJob(data, user_id);
  }

  @MessagePattern('update_job')
  public async updateProjectData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.jobService.updateJob(data, data.id);
  }

  @MessagePattern('get_job_by_id')
  public async getProjectByIdData(@Payload() id: number): Promise<any> {
    return this.jobService.getJobById(id, 0);
  }

  @MessagePattern('get_all_job')
  public async getAllUserJobsData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.jobService.getAllUserJobs(data, null);
  }

  @MessagePattern('delete_job')
  public async deleteProjectData(@Payload() id: number): Promise<any> {
    return this.jobService.deleteJobById(id, 0);
  }

  @MessagePattern('add_job_proposal')
  public async createJobProposalData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.jobService.createJobProposal(data, user_id);
  }

  @MessagePattern('update_job_proposal')
  public async updateJobProposalData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.jobService.updateJobProposal(data, data.id);
  }

  @MessagePattern('get_job_proposal_by_id')
  public async getJobProposalByIdData(@Payload() id: number): Promise<any> {
    return this.jobService.getJobProposalById(id);
  }

  @MessagePattern('delete_job_proposal')
  public async deleteJobProposalByIdData(@Payload() id: number): Promise<any> {
    return this.jobService.deleteJobProposalById(id);
  }

  @MessagePattern('get_job_proposal_by_job_id')
  public async getJobProposalByJobIdData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.jobService.getJobProposalByJobId(
      data.id,
      data.filter,
      null,
      null,
    );
  }

  @MessagePattern('add_job_proposal_review')
  public async createJobProposalReviewData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.jobService.createJobProposalReview(data, user_id);
  }

  @MessagePattern('update_job_proposal_review')
  public async updateJobProposalReviewData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.jobService.updateJobProposalReview(data, data.id);
  }

  @MessagePattern('get_job_proposal_review_by_id')
  public async getJobProposalReviewByIdData(
    @Payload() id: number,
  ): Promise<any> {
    return this.jobService.getJobProposalReviewById(id);
  }

  @MessagePattern('get_all_review')
  public async getAllJobProposalReviewData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.jobService.getAllJobProposalReview(data);
  }

  @MessagePattern('delete_job_proposal_review')
  public async deleteJobProposalReviewByIdData(
    @Payload() id: number,
  ): Promise<any> {
    return this.jobService.deleteJobProposalReviewById(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  async createJob(
    @Body(ValidationPipe) data: CreateJobBasicDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJob(data, user_id);
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
  @Post('/files')
  async createJobFiles(
    @Body(ValidationPipe) data: CreateJobFilesDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJobFiles(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/files/:id')
  async updateJobFiles(
    @Body(ValidationPipe) data: UpdateJobFilesDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateJobFiles(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/files/:upload_by/job/:id')
  async getJobFilesByJobId(
    @Param('id') id: number,
    @Param('upload_by') upload_by: FILE_UPLOAD_BY,
  ): Promise<any> {
    return await this.jobService.getJobFilesByJobId(id, upload_by);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/files/:id')
  async deleteFilesById(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.deleteFilesById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteJobById(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.deleteJobById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/proposal')
  async createJobProposal(
    @Body(ValidationPipe) data: CreateJobProposalDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJobProposal(data, user_id);
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
  @Get('/proposal/user/:proposal_job_status')
  async getUserJobProposal(
    @Param() proposal_job_status: ProposalJobStatusDto,
    @Query() search: SearchDataDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getUserJobProposal(
      proposal_job_status.proposal_job_status,
      search.search,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/proposal/job/:id')
  async getJobProposalByJobId(
    @Param() id: GetByIdDto,
    @Query() data: JobProposalFilterDTO,
  ): Promise<any> {
    return await this.jobService.getJobProposalByJobId(
      id.id,
      data.filter,
      data.search,
      data.proposal_status,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/proposal-reply')
  async createJobProposalReply(
    @Body(ValidationPipe) data: CreateJobProposalReplyDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJobProposalReply(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/proposal-reply/:id')
  async updateJobProposalReply(
    @Body(ValidationPipe) data: UpdateJobProposalReplyDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateJobProposalReply(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/proposal-reply/:id')
  async deleteJobProposalReplyById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.deleteJobProposalReplyById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/proposal-reply/:id')
  async getJobProposalReplyById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobProposalReplyById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/proposal-reply/proposal/:id')
  async getJobProposalReplyByJobId(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobProposalByProposalId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/proposal-reply/user/:id')
  async getJobProposalReplyByUserId(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobProposalReplyByUserId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/user-expertise/proposal')
  async createUserExpertiseProposal(
    @Body(ValidationPipe) data: CreateUserExpertiseProposalDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createUserExpertiseProposal(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/user-expertise/proposal/:id')
  async updateUserExpertiseProposal(
    @Body(ValidationPipe) data: UpdateUserExpertiseProposalDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateUserExpertiseProposal(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/user-expertise/proposal/:id')
  async deleteUserExpertiseProposalById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.deleteUserExpertiseProposalById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise/proposal/:id')
  async getUserExpertiseProposalById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getUserExpertiseProposalById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise/proposal/user/:id')
  async getUserExpertiseProposalByJobId(
    @Param() id: GetByIdDto,
    @Query() search: SearchDataDto,
  ): Promise<any> {
    return await this.jobService.getUserExpertiseProposalByUserId(
      search.search,
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/user-expertise/proposal-reply')
  async createUserExpertiseProposalReply(
    @Body(ValidationPipe) data: CreateUserExpertiseProposalReplyDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createUserExpertiseProposalReply(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/user-expertise/proposal-reply/:id')
  async updateUserExpertiseProposalReply(
    @Body(ValidationPipe) data: UpdateUserExpertiseProposalReplyDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateUserExpertiseProposalReply(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/user-expertise/proposal-reply/:id')
  async deleteUserExpertiseProposalReplyById(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.deleteUserExpertiseProposalReplyById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise/proposal-reply/:id')
  async getUserExpertiseProposalReplyById(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.getUserExpertiseProposalReplyById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise/proposal-reply/user/:id')
  async getUserExpertiseProposalReplyByUserId(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.getUserExpertiseProposalReplyByUserId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise/proposal-reply/proposal/:id')
  async getUserExpertiseProposalReplyByProposalId(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.getUserExpertiseProposalReplyByProposalId(
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/user-expertise/report')
  async createUserExpertiseReport(
    @Body() data: createUserExpertiseReportDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createUserExpertiseReport(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/user-expertise/report/:id')
  async updateUserExpertiseReport(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateUserExpertiseReportDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.updateUserExpertiseReport(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise/report/:id')
  async getUserExpertiseReport(@Param() id: GetByIdDto): Promise<any> {
    return this.jobService.getUserExpertiseReport(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/user-expertise/report/:id')
  async deleteUserExpertiseReport(@Param() data: GetByIdDto): Promise<any> {
    return this.jobService.deleteUserExpertiseReport(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/user-expertise-review')
  async createJobProposalReview(
    @Body(ValidationPipe) data: CreateUserExpertiseReviewDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJobProposalReview(data, user_id);
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
  @Get('/user-expertise-review/proposal/:id')
  async getJobProposalReviewByProposalId(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getJobProposalReviewByProposalId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise-review/job/:id')
  async getJobProposalReviewByJobId(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getJobProposalReviewByJobId(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/user-expertise-review/reply')
  async createJobProposalReviewReply(
    @Body(ValidationPipe) data: CreateUserExpertiseReviewReplyDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJobProposalReviewReply(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/user-expertise-review/reply/:id')
  async updateJobProposalReviewReply(
    @Body(ValidationPipe) data: UpdateUserExpertiseReviewReplyDTO,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateJobProposalReviewReply(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/user-expertise-review/reply/:id')
  async deleteJobProposalReviewReplyById(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.deleteJobProposalReviewReplyById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-expertise-review/reply/review/:id')
  async getJobProposalReviewReplyByJobId(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.getJobProposalReviewReplyByReviewId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/user-expertise-review/reaction')
  async createUserExpertiseReviewReaction(
    @Body(ValidationPipe) data: CreateUserExpertiseReviewReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createUserExpertiseReview(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/user-expertise-review/reaction/:id')
  async updateUserExpertiseReviewReaction(
    @Body(ValidationPipe) data: UpdateUserExpertiseReviewReactionDto,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateUserExpertiseReview(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/reaction')
  async createJobReaction(
    @Body(ValidationPipe) data: CreateJobReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJobReaction(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/reaction/:id')
  async updateJobReaction(
    @Body(ValidationPipe) data: UpdateJobReactionDto,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.jobService.updateJobReaction(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/reaction/:id')
  async deleteJobReactionById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.deleteJobReactionById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/reaction/:id')
  async getJobReactionById(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobReactionById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/job-proposal/payment')
  async createJobProposalPayment(
    @Body(ValidationPipe) data: CreateJobProposalPaymentDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJobProposalPayment(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/job-proposal/payment/job/:id')
  async getJobProposalPaymentByJobId(@Param() id: GetByIdDto): Promise<any> {
    return await this.jobService.getJobProposalPaymentByJobId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/job-proposal/payment/user/:id')
  async getJobProposalPaymentByJobAndUserId(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getJobProposalPaymentByJobAndUserId(
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/job-proposal/payment-user')
  async getAllUserPayment(@CurrentUser() user_id: number): Promise<any> {
    return await this.jobService.getAllUSerPayment(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  async getAllUserJob(
    @Query() data: JobFilterDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getAllUserJobs(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all')
  async getAllJobs(
    @Query() data: JobALLFilterDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getAllJobs(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getJobById(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getJobById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/project/:id')
  async getJobByProjectId(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getJobByProjectId(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/job-proposal/billing')
  async createJobProposalBillingSetting(
    @Body(ValidationPipe) data: CreateJobProposalBillingSettingDTO,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.createJobProposalBillingSetting(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/job-proposal/billing/:id')
  async getJobProposalBillingById(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getJobProposalBillingById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/job-proposal/billing/:id')
  async updateJobProposalBilling(
    @Body(ValidationPipe) data: UpdateJobProposalBillingSettingDTO,
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.updateJobProposalBilling(data, id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/job-proposal/billing/:id')
  async deleteJobJobProposalBilling(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.deleteJobJobProposalBilling(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/job-proposal/billing/user/:id')
  async getJobProposalBillingByJobAndUserId(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.jobService.getJobProposalBillingByJobAndUserId(
      id.id,
      user_id,
    );
  }
}
