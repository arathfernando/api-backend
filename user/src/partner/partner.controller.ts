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
import { AllowUnauthorizedRequest } from 'src/helper/decorator/allow.unauthorized.decorator';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import {
  CreatePartnerContactUsDto,
  CreatePartnerDto,
  GetByIdDto,
  GetBySlugDto,
  PaginationDto,
  SearchNameDto,
  UpdatePartnerContactUsDto,
  UpdatePartnerDto,
  PartnersByLanguageDto,
} from 'src/helper/dtos';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { PartnerService } from './partner.service';
@ApiTags('Partner')
@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @MessagePattern('create_partner')
  public async create_partner(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    return this.partnerService.createPartner(data, data.partner_image, user_id);
  }

  @MessagePattern('update_partner')
  public async update_partner(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.partnerService.updatePartner(data.id, data.data, null, 0);
  }

  @MessagePattern('get_partners')
  public async get_partners(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.partnerService.getPartners(data, 0);
  }

  @MessagePattern('get_community_partners')
  public async getCommunityPartners(@Payload() data: any): Promise<any> {
    return this.partnerService.getCommunityPartners(data);
  }

  @MessagePattern('get_contest_partners')
  public async getContestPartners(@Payload() data: any): Promise<any> {
    return this.partnerService.getContestPartners(data);
  }

  @MessagePattern('get_partner_by_id')
  public async get_partner_by_id(@Payload() id: number): Promise<any> {
    return this.partnerService.getPartnerById(id);
  }

  @MessagePattern('get_partner_by_contest_id')
  public async get_partner_by_contest_id(@Payload() id: number): Promise<any> {
    return this.partnerService.getPartnerByContestId(id);
  }

  @MessagePattern('delete_partner')
  public async delete_partner(@Payload() id: number): Promise<any> {
    return this.partnerService.deletePartner(id, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('partner_image'))
  public async createPartner(
    @UploadedFile() partner_image: Express.Multer.File,
    @Body(ValidationPipe) data: CreatePartnerDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.partnerService.createPartner(
      data,
      partner_image,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('partner_image'))
  public async updatePartner(
    @Param() id: GetByIdDto,
    @UploadedFile() partner_image: Express.Multer.File,
    @Body(ValidationPipe) data: UpdatePartnerDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.partnerService.updatePartner(
      id.id,
      data,
      partner_image,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  public async getAllPartner(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.partnerService.getPartners(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  public async getPartnerById(@Param() id: GetByIdDto): Promise<any> {
    return await this.partnerService.getPartnerById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/search/data')
  public async searchPartnerName(@Query() data: SearchNameDto): Promise<any> {
    return await this.partnerService.searchPartnerName(data.name);
  }

  @AllowUnauthorizedRequest()
  @Get('/view/data')
  public async getPartner(
    @Query() data: GetBySlugDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.partnerService.getPartner(data, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/view/partners')
  public async getPartners(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.partnerService.getPartners(data, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/partners/language')
  public async getPartnersByLanguage(
    @Query() data: PartnersByLanguageDto,
  ): Promise<any> {
    return await this.partnerService.getPartnersByLanguage(data.language_code);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/view/users-partners')
  public async getPartnersByUserId(
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.partnerService.getPartnersByUserId(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  public async deletePartner(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.partnerService.deletePartner(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/partner-contact-us')
  public async createPartnerContactUs(
    @Body(ValidationPipe) data: CreatePartnerContactUsDto,
  ): Promise<any> {
    return await this.partnerService.createPartnerContactUs(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/partner-contact-us/:id')
  public async updatePartnerContactUs(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdatePartnerContactUsDto,
  ): Promise<any> {
    return await this.partnerService.updatePartnerContactUs(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/partner-contact-us/:id')
  public async deletePartnerContactUs(@Param() id: GetByIdDto): Promise<any> {
    return await this.partnerService.deletePartnerContactUs(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/partner-contact-us/:id')
  public async getPartnerContactUs(@Param() id: GetByIdDto): Promise<any> {
    return await this.partnerService.getPartnerContactUs(id.id);
  }
}
