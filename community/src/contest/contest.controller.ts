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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import {
  ContestSubmissionDto,
  ContestSubmissionReviewDto,
  CreateContestCriteriaDto,
  CreateContestDto,
  CreateContestRuleDto,
  CreateCustomerIdentityDto,
  GetContestantDto,
  GetSingleReviewDto,
  SearchWithPaginationDto,
  SubmissionReviewDto,
  UpdateContestCriteriaDto,
  UpdateContestDto,
  UpdateContestRuleDto,
  UpdateCustomerIdentityDto,
} from 'src/core/dtos/contests';
import { UpdateContestantDto } from 'src/core/dtos/contests/update-contestant.dto';
import { JoinContest } from 'src/core/dtos/contests/join-contest.dto';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { ContestService } from './contest.service';
import { Cron } from '@nestjs/schedule';
import {
  ContestReactionDto,
  UpdateContestReactionDto,
} from 'src/core/dtos/contests/contest-reaction.dto';
import { GetContestByState } from 'src/core/dtos/contests/get-user-contest-state.dto';
import { VerifyOtpDto } from 'src/core/dtos/contests/verify-code.dto';

@ApiTags('Contest')
@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}
  @Cron('0 0 * * *')
  public async handleCron() {
    await this.contestService.cronUpdateContestState();
  }

  @MessagePattern('add_contest')
  public async createContestData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    return this.contestService.createContest(
      data,
      user_id,
      data.contest_state,
      data.contest_cover,
    );
  }

  @MessagePattern('update_contest')
  public async updateContestData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.updateContest(
      data.id,
      data,
      0,
      data.contest_cover,
    );
  }

  @MessagePattern('create_contest_customer_identity')
  public async create_contest_customer_identity(
    @Payload() data: any,
  ): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    return this.contestService.createCustomerIdentity(
      data,
      user_id,
      data.company_logo,
    );
  }

  @MessagePattern('update_contest_customer_identity')
  public async update_contest_customer_identity(
    @Payload() data: any,
  ): Promise<any> {
    data = JSON.parse(data);
    const file = data.company_logo;
    const id = data.id;
    delete data.company_logo;
    delete data.id;
    return this.contestService.updateCustomerIdentity(id, data, 0, file);
  }

  @MessagePattern('get_contest_by_id')
  public async getContestByIdData(@Payload() id: number): Promise<any> {
    return this.contestService.getContestById(id);
  }

  @MessagePattern('delete_contest')
  public async deleteContestData(@Payload() id: number): Promise<any> {
    return this.contestService.deleteContest(0, id);
  }

  @MessagePattern('get_contest_customer_identity')
  public async get_contest_customer_identity(
    @Payload() id: number,
  ): Promise<any> {
    return this.contestService.getContestCustomerIdentity(id);
  }

  @MessagePattern('create_contest_criteria')
  public async create_contest_criteria(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = 0;
    return this.contestService.createContestCriteria(data, user_id);
  }

  @MessagePattern('update_contest_criteria')
  public async update_contest_criteria(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const id = data.id;
    delete data.id;
    return this.contestService.updateContestCriteria(id, data, 0);
  }

  @MessagePattern('get_contest_criteria')
  public async get_contest_criteria(@Payload() id: number): Promise<any> {
    return this.contestService.getContestCriteria(id);
  }

  @MessagePattern('create_contest_rule')
  public async create_contest_rule(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = 0;
    delete data.attachments;
    return this.contestService.createContestRules(data, user_id);
  }

  @MessagePattern('update_contest_rule')
  public async update_contest_rule(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const id = data.id;
    return this.contestService.updateContestRule(id, data, 0);
  }

  @MessagePattern('get_contest_rule')
  public async get_contest_rule(@Payload() id: number): Promise<any> {
    return this.contestService.getContestRules(id);
  }

  @MessagePattern('get_contest_by_state')
  public async get_contest_by_state(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.contestService.getContestByState(data, user_id);
  }

  @MessagePattern('get_contestant')
  public async get_contestant_by_role(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.getContestant(
      data.contest_id,
      data.status,
      data.role,
    );
  }

  @MessagePattern('update_contestant')
  public async delete_contestant(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.updateContestantById(data.status, data.id, 0);
  }

  @MessagePattern('add_contestant')
  public async add_contestant(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.addContestant(data);
  }

  @MessagePattern('get_revision')
  public async get_revision(): Promise<any> {
    return this.contestService.getAllSubmissionAdmin();
  }

  @MessagePattern('get_revision_by_contest')
  public async get_revision_by_contest(
    @Payload() contest_id: number,
  ): Promise<any> {
    return this.contestService.getAllSubmission(contest_id);
  }

  @MessagePattern('delete_contest_revision')
  public async deleteContestRevisionData(@Payload() id: number): Promise<any> {
    return this.contestService.deleteContestRevisionData(0, id);
  }

  @MessagePattern('create_contest_template')
  public async createContestTemplate(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.createContestTemplate(data);
  }

  @MessagePattern('update_contest_template')
  public async updateContestTemplate(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.updateContestTemplate(data);
  }

  @MessagePattern('get_contest_templates')
  public async getContestTemplates(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.getContestTemplates(data);
  }

  @MessagePattern('get_contest_template')
  public async getContestTemplate(@Payload() id: number): Promise<any> {
    return this.contestService.getContestTemplateById(id);
  }

  @MessagePattern('delete_contest_template')
  public async deleteContestTemplate(@Payload() id: number): Promise<any> {
    return this.contestService.deleteContestTemplateById(id);
  }

  @MessagePattern('get_popular_contest')
  public async get_popular_contest(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.getPopularContests(data, 0);
  }

  @MessagePattern('remove_contest_contestant')
  public async removeContestantData(@Payload() id: number): Promise<any> {
    return this.contestService.removeContestant(id);
  }

  @MessagePattern('update_is_claimed')
  public async updateClimePrize(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.updateClimePrize(data.id, data.contest_prizes);
  }

  @MessagePattern('add_contest_claim_prize')
  public async addClimePrize(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.contestService.contestClaimPrize(data.id, data.contest_prizes);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/general')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('contest_cover'))
  async createContest(
    @UploadedFile() contest_cover: Express.Multer.File,
    @Body(ValidationPipe) data: CreateContestDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.createContest(
      data,
      user_id,
      null,
      contest_cover,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/general/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('contest_cover'))
  async updateContest(
    @UploadedFile() contest_cover: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateContestDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.updateContest(
      id.id,
      data,
      user_id,
      contest_cover,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/general/:id')
  async getContestById(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getContestById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/customer-identity')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('company_logo'))
  async createCustomerIdentity(
    @UploadedFile() company_logo: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCustomerIdentityDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.createCustomerIdentity(
      data,
      user_id,
      company_logo,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/customer-identity/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('company_logo'))
  async updateCustomerIdentity(
    @UploadedFile() company_logo: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCustomerIdentityDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.updateCustomerIdentity(
      id.id,
      data,
      user_id,
      company_logo,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/customer-identity/:id')
  async getContestCustomerIdentity(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getContestCustomerIdentity(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/contest-criteria')
  async createContestCriteria(
    @Body(ValidationPipe) data: CreateContestCriteriaDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.createContestCriteria(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/contest-criteria/:id')
  async updateContestCriteria(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateContestCriteriaDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.updateContestCriteria(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest-criteria/:id')
  async getContestCriteria(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getContestCriteria(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/contest-rules')
  async createContestRules(
    @Body(ValidationPipe) data: CreateContestRuleDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.createContestRules(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/contest-rules/:id')
  async updateContestRule(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateContestRuleDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.updateContestRule(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest-rules/:id')
  async getContestRules(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getContestRules(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/join-contest')
  async joinContest(
    @Body() data: JoinContest,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.joinContest(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contests')
  async getContest(@Query() data: PaginationDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.contestService.getContest(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contests/state')
  async getContestByState(
    @Query() data: GetContestByState,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.getContestByState(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest/:id')
  async getContestAllDetails(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.getContestAllDetails(user_id, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/contest/:id')
  async deleteContest(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.deleteContest(user_id, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest/dashboard/popular')
  async getPopularContests(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.getPopularContests(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest/dashboard/search')
  async searchContests(
    @Query() data: SearchWithPaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.searchContests(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/revision/:id')
  async getAllSubmission(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getAllSubmission(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/revision/:id')
  async submitContestSubmission(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: ContestSubmissionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.submitContestSubmission(
      id.id,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/reviews/:id')
  async getAllSubmissionReviews(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getAllReviews(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/reviews/:contest_id/:id')
  async getSubmissionReview(@Param() id: GetSingleReviewDto): Promise<any> {
    return await this.contestService.getSubmissionReview(id.id, id.contest_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiBody({ type: [ContestSubmissionReviewDto] })
  @Post('/review/:contest_id/:criteria_submission')
  async submitContestSubmissionReview(
    @Param() ids: SubmissionReviewDto,
    @Body() data: ContestSubmissionReviewDto[],
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.reviewContestSubmission(
      ids.contest_id,
      ids.criteria_submission,
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/contest-contestant/:id')
  async updateContestById(
    @Param() id: GetByIdDto,
    @Body() data: UpdateContestantDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.contestService.updateContestantById(
      data.status,
      id.id,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest-contestant/:id')
  async getContestantByRole(
    @Query() data: GetContestantDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    const contest_id = data.contest_id ? data.contest_id : 0;
    return this.contestService.getUserContestant(contest_id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/contest-contestant/:id')
  async removeContestant(@Param() data: GetByIdDto): Promise<any> {
    return this.contestService.removeContestant(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/contest/reaction')
  async createContestReaction(@Body() data: ContestReactionDto): Promise<any> {
    return await this.contestService.createContestReaction(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/contest/reaction/:id')
  async updateContestReaction(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateContestReactionDto,
  ): Promise<any> {
    return await this.contestService.updateContestReaction(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest/reaction/:id')
  async getContestReaction(@Param() id: GetByIdDto): Promise<any> {
    return this.contestService.getContestReaction(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/contest/reaction/:id')
  async deleteContestReaction(@Param() data: GetByIdDto): Promise<any> {
    return this.contestService.deleteContestReaction(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/contest/claim-prize/generate-code')
  async generateRandomCode(@CurrentUser() user_id: number): Promise<any> {
    return this.contestService.generateRandomCode(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/contest/claim-prize/verify-code/')
  async verifyCode(
    @CurrentUser() user_id: number,
    @Body() data: VerifyOtpDto,
  ): Promise<any> {
    return this.contestService.verifyCode(user_id, data);
  }
}
