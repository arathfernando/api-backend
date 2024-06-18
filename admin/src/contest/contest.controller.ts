import {
  Body,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  Controller,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  UploadedFiles,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ContestService } from './contest.service';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  CreateContestCriteriaDto,
  CreateContestDto,
  CreateContestRuleDto,
  CreateContestTemplateDto,
  CreateCustomerIdentityDto,
  GetByIdDto,
  GetContestantDto,
  GetContestByState,
  PaginationDto,
  UpdateContestantDto,
  UpdateContestCriteriaDto,
  UpdateContestDto,
  UpdateContestRuleDto,
  UpdateContestTemplateDto,
  UpdateCustomerIdentityDto,
} from 'src/helper/dtos';
import { AddContestant } from 'src/helper/dtos/add-contestant.dto';

@ApiTags('Admin Contests')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('contest_cover'))
  async createContest(
    @UploadedFile() contest_cover: Express.Multer.File,
    @Body(ValidationPipe) data: CreateContestDto,
  ): Promise<any> {
    return await this.contestService.createContest(data, contest_cover);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('contest_cover'))
  async updateContest(
    @UploadedFile() contest_cover: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateContestDto,
  ): Promise<any> {
    return await this.contestService.updateContest(id.id, data, contest_cover);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getContestById(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getContestById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteContest(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.deleteContest(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/customer-identity')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('company_logo'))
  async createCustomerIdentity(
    @UploadedFile() company_logo: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCustomerIdentityDto,
  ): Promise<any> {
    return await this.contestService.createCustomerIdentity(data, company_logo);
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
  ): Promise<any> {
    return await this.contestService.updateCustomerIdentity(
      id.id,
      data,
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
  ): Promise<any> {
    return await this.contestService.createContestCriteria(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/contest-criteria/:id')
  async updateContestCriteria(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateContestCriteriaDto,
  ): Promise<any> {
    return await this.contestService.updateContestCriteria(id.id, data);
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
  ): Promise<any> {
    return await this.contestService.createContestRules(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/contest-rules/:id')
  async updateContestRule(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateContestRuleDto,
  ): Promise<any> {
    return await this.contestService.updateContestRule(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest-rules/:id')
  async getContestRules(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getContestRules(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest/state')
  async getContestByState(@Query() state: GetContestByState): Promise<any> {
    return await this.contestService.getContestByState(state);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contestant/contestants')
  async getContestantByRole(@Query() data: GetContestantDto): Promise<any> {
    return await this.contestService.getContestantByContestId(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/contest-contestant/:id')
  async updateContestById(
    @Param() id: GetByIdDto,
    @Body() data: UpdateContestantDto,
  ): Promise<any> {
    return await this.contestService.updateContestantById(id, data);
  }

  @Get('revision/revision')
  async getRevision(): Promise<any> {
    return await this.contestService.getRevision();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/revision/:id')
  async getContestRevision(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getRevisionByContest(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/revision/:id')
  async deleteContestRevision(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.deleteContestRevision(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/contestant')
  async addContestant(@Body() data: AddContestant): Promise<any> {
    return await this.contestService.addContestant(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @Post('/contest-template')
  async createContestTemplate(
    @UploadedFiles() attachments: Array<Express.Multer.File>,
    @Body(ValidationPipe) data: CreateContestTemplateDto,
  ): Promise<any> {
    return await this.contestService.createContestTemplate(data, attachments);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @Put('/contest-template/:id')
  async updateContestTemplate(
    @Param() id: GetByIdDto,
    @UploadedFiles() attachments: Array<Express.Multer.File>,
    @Body(ValidationPipe) data: UpdateContestTemplateDto,
  ): Promise<any> {
    return await this.contestService.updateContestTemplate(
      id.id,
      data,
      attachments,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all/contest-template')
  async getContestTemplates(@Query() data: PaginationDto): Promise<any> {
    return await this.contestService.getContestTemplates(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/contest-template/:id')
  async getContestTemplateById(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.getContestTemplateById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/contest-template/:id')
  async deleteContestTemplate(@Param() id: GetByIdDto): Promise<any> {
    return await this.contestService.deleteContestTemplate(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/contest-contestant/:id')
  async removeContestant(@Param() data: GetByIdDto): Promise<any> {
    return this.contestService.removeContestant(data.id);
  }
}
