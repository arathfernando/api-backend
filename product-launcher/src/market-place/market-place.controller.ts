import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GIG_RESPONSE_STATUS } from 'src/core/constant/enum.constant';
import { AllowUnauthorizedRequest } from 'src/core/decorator/allow.unauthorized.decorator';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import {
  CreateFaqDto,
  CreateGalleryDto,
  CreateGigDto,
  CreatePackageDto,
  GetByIdDto,
  GetBySlugDto,
  PaginationDto,
  UpdateFaqDto,
  UpdateGalleryDto,
  UpdateGigDto,
  UpdatePackageDto,
} from 'src/core/dtos';
import { FilterRequestDataDto } from 'src/core/dtos/filter-request-data.dto';
import { CreateFeedbackDto } from 'src/core/dtos/market-place/create-feedback.dto';
import { CreateRequestDto } from 'src/core/dtos/market-place/create-request.dto';
import { FeedbackFilterDto } from 'src/core/dtos/market-place/feedback-filter.dto';
import { FilterDataDto } from 'src/core/dtos/market-place/filter.dto';
import {
  CreateReactionDto,
  UpdateReactionDto,
} from 'src/core/dtos/market-place/gig-reaction.dto';
import {
  CreateFeedbackReactionDto,
  UpdateFeedbackReactionDto,
} from 'src/core/dtos/market-place/gig-feedback-reaction.dto';
import {
  CreateRequestResponseDto,
  UpdateRequestResponseDto,
} from 'src/core/dtos/market-place/req-res.dto';
import { UpdateFeedbackDto } from 'src/core/dtos/market-place/update-feedback.dto';
import { UpdateRequestDto } from 'src/core/dtos/market-place/update-request.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { MarketPlaceService } from './market-place.service';
import { CreateGigPaymentDto } from 'src/core/dtos/market-place/gig-payment.dto';
import { PackageAllProcessDto } from 'src/core/dtos/market-place/package-all-process-dto';
import { FaqAllProcessDto } from 'src/core/dtos/market-place/faq-all-process-dto';
import { GigFilterDataDto } from 'src/core/dtos/market-place/gig-filter.dto';
import { GigCategoryFilterDataDto } from 'src/core/dtos/market-place/gig-category-filter.dto';
import {
  UpdateGigReportDto,
  createGigReportDto,
} from 'src/core/dtos/market-place/gig-report.dto';

@ApiTags('Market Place')
@Controller('market-place')
export class MarketPlaceController {
  constructor(private readonly marketPlaceService: MarketPlaceService) {}

  @MessagePattern('add_gig_category')
  public async createGigCategoryData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.createGigCategory(data, data.created_by);
  }

  @MessagePattern('update_gig_category')
  public async updateGigCategoryData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.marketPlaceService.updateGigCategory(data.id, data);
  }

  @MessagePattern('get_gig_category_by_id')
  public async getGigCategoryByIdData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.getGigCategoryById(id);
  }

  @MessagePattern('get_gig_all_category')
  public async getGigAllCategoryData(): Promise<any> {
    return this.marketPlaceService.getGigAllCategory();
  }

  @MessagePattern('delete_gig_category')
  public async deleteGigCategoryData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.deleteGigCategory(id);
  }

  @MessagePattern('add_gig')
  public async createGigData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    return this.marketPlaceService.createGig(data, user_id);
  }

  @MessagePattern('update_gig')
  public async updateGigData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.marketPlaceService.updateGig(data.id, data, 0);
  }

  @MessagePattern('get_all_gigs')
  public async getAllGigsData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.getAllGigs(data);
  }

  @MessagePattern('get_gig_by_id')
  public async getProjectByIdData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.getGigById(data.id, data.user_id);
  }

  @MessagePattern('delete_gig')
  public async deleteGigData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.deleteGig(id, 0);
  }

  @MessagePattern('add_package')
  public async createPackageData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.createPackage(data.data, 0);
  }

  @MessagePattern('update_package')
  public async updateGigPackageData(data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.marketPlaceService.updateGigPackage(data, 0);
  }

  @MessagePattern('get_gig_package_by_gig_id')
  public async getGigPackageByGigIdData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.getGigPackageByGigId(id);
  }

  @MessagePattern('delete_package')
  public async deletePackageData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.deletePackage(id, 0);
  }

  @MessagePattern('add_gig_gallery')
  public async createGigGalleryData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.createGigGallery(
      data.gig_id,
      data,
      data.image,
      0,
    );
  }

  @MessagePattern('update_gig_gallery')
  public async updateGigGalleryData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const gig_id = data.gig_id;
    delete data.gig_id;
    return await this.marketPlaceService.updateGigGallery(
      gig_id,
      data.id,
      data,
      false,
      0,
    );
  }

  @MessagePattern('get_gig_gallery_by_gig_id')
  public async getGigGalleryByGigIdData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.getGigGalleryByGigId(id);
  }

  @MessagePattern('delete_gig_gallery')
  public async deleteGalleryData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.deleteGallery(id, 0);
  }

  @MessagePattern('add_gig_request')
  public async createGigRequestData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.createGigRequest(
      data.gig_id,
      data,
      data.image,
      0,
    );
  }

  @MessagePattern('update_gig_request')
  public async updateGigRequestData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const gig_id = data.gig_id;
    const id = data.id;
    const image = data.image;
    delete data.image;
    delete data.gig_id;
    delete data.id;
    return await this.marketPlaceService.updateGigRequest(
      gig_id,
      id,
      data,
      image,
    );
  }

  @MessagePattern('get_gig_request_by_gig_id')
  public async getGigRequestByGigIdData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.getGigRequestByGigId(id);
  }

  @MessagePattern('delete_gig_request')
  public async deleteRequestData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.deleteRequest(id, 0);
  }

  @MessagePattern('add_gig_request_response')
  public async createGigRequestResponseData(
    @Payload() data: any,
  ): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.createGigRequestResponse(data, 0);
  }

  @MessagePattern('update_request_response')
  public async updateGigRequestResponseData(data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.marketPlaceService.updateGigRequestResponse(
      data.id,
      data,
    );
  }

  @MessagePattern('get_gig_request_response_by_gig_id')
  public async getGigRequestResponseByReqIdData(
    @Payload() data: any,
  ): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.getGigRequestResponseByReqId(
      data.id,
      data.response_status,
    );
  }

  @MessagePattern('delete_gig_request_response')
  public async deleteRequestResponseData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.deleteRequestResponse(id);
  }

  @MessagePattern('get_all_gig_feedback')
  public async getAllFeedbackData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.getAllFeedback(data);
  }

  @MessagePattern('add_gig_feedback')
  public async createGigFeedBackData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return this.marketPlaceService.createFeedback(data, user_id);
  }

  @MessagePattern('update_gig_feedback')
  public async updateGigFeedBackData(data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.created_by;
    delete data.created_by;
    return await this.marketPlaceService.updateGigFeedback(
      data.id,
      data,
      user_id,
    );
  }

  @MessagePattern('delete_gig_feedback')
  public async deleteFeedbackData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.deleteFeedback(id, 0);
  }

  @MessagePattern('add_gig_faq')
  public async createFaqData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.marketPlaceService.createFaq(data, 0);
  }

  @MessagePattern('update_gig_faq')
  public async updateGigFaqData(data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.marketPlaceService.updateGigFaq(data, 0);
  }

  @MessagePattern('get_gig_faq_by_gig_id')
  public async getGigFaqByGigIdData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.getGigFaqByGigId(id);
  }

  @MessagePattern('delete_gig_faq')
  public async deleteFaqData(@Payload() id: number): Promise<any> {
    return this.marketPlaceService.deleteFaq(id, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new gig' })
  @ApiBody({ type: CreateGigDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGig(
    @Body(ValidationPipe) createGigDto: CreateGigDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createGig(createGigDto, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  async updateGig(
    @Param('id') id: number,
    @Body(ValidationPipe)
    updateData: UpdateGigDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.updateGig(id, updateData, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all gigs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gigs retrieved successfully',
  })
  async getAllGigs(
    @Query(ValidationPipe) pagination: PaginationDto,
  ): Promise<any> {
    return this.marketPlaceService.getAllGigs(pagination);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/filter')
  @ApiOperation({ summary: 'Get all gigs' })
  async getAllGigsFilter(
    @CurrentUser() user_id: number,
    @Query(ValidationPipe) pagination: GigFilterDataDto,
  ): Promise<any> {
    return this.marketPlaceService.getAllGigsFilter(pagination, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category/filter')
  @ApiOperation({ summary: 'Get all gigs category' })
  async getAllCategoryFilter(
    @Query(ValidationPipe) pagination: GigCategoryFilterDataDto,
  ): Promise<any> {
    return this.marketPlaceService.getAllCategoryFilter(pagination);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  @ApiOperation({ summary: 'Get gig by ID' })
  async getGigById(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.getGigById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/market-place/:slug')
  @ApiOperation({ summary: 'Get gig by slug' })
  async getGigBySlug(@Param() slug: GetBySlugDto): Promise<any> {
    return this.marketPlaceService.getGigBySlug(slug.slug);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/gig')
  @ApiOperation({ summary: 'Get gig by ID' })
  async getOpenGigById(@Query() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.getGigById(id.id, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category/:id')
  @ApiOperation({ summary: 'Get gig by category' })
  async getGigByCategory(@Param() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.getGigsByCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/tag/:id')
  @ApiOperation({ summary: 'Get gig by category' })
  async getGigByTag(@Param() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.getGigsByTag(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/search/gig')
  @ApiOperation({ summary: 'Search for gigs' })
  async getGigBySearch(
    @Query() data: FilterDataDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.getGigsBySearch(data, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/search')
  @ApiOperation({ summary: 'Search for gigs' })
  async getOpenGigBySearch(@Query() data: FilterDataDto): Promise<any> {
    return this.marketPlaceService.getGigsBySearch(data, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete gig by ID' })
  async deleteGig(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.deleteGig(id.id, user_id);
  }

  // Gig packages end points
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/package')
  @ApiOperation({ summary: 'Create a Gig Package' })
  @ApiBody({ type: [CreatePackageDto] })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigPackage(
    @Body(ValidationPipe) data: CreatePackageDto[],
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createPackage(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/package/')
  @ApiOperation({ summary: 'Update gig package' })
  @ApiBody({ type: [UpdatePackageDto] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig updated successfully',
  })
  async updateGigPackage(
    @Body(ValidationPipe) updateData: UpdatePackageDto[],
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.updateGigPackage(updateData, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/:gig_id/package')
  @ApiOperation({ summary: 'Get gig package by gig ID' })
  async getGigPackageByGigId(@Param('gig_id') gig_id: number): Promise<any> {
    return this.marketPlaceService.getGigPackageByGigId(gig_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/package/:id')
  @ApiOperation({ summary: 'Delete package by id' })
  async deletePackage(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.deletePackage(id.id, user_id);
  }

  // Gig FAQ end-points
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/faq')
  @ApiOperation({ summary: 'Create a Gig FAQs' })
  @ApiBody({ type: [CreateFaqDto] })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigFaq(
    @Body(ValidationPipe) data: CreateFaqDto[],
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createFaq(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/faq/')
  @ApiOperation({ summary: 'Update gig FAQ' })
  @ApiBody({ type: [UpdateFaqDto] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig FAQ updated successfully',
  })
  async updateGigFaq(
    @Body(ValidationPipe)
    updateData: UpdateFaqDto[],
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.updateGigFaq(updateData, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/:gig_id/faq')
  @ApiOperation({ summary: 'Get gig FAQ by gig ID' })
  async getGigFaqByGigId(@Param('gig_id') gig_id: number): Promise<any> {
    return this.marketPlaceService.getGigFaqByGigId(gig_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/faq/:id')
  @ApiOperation({ summary: 'Delete FAQ by id' })
  async deleteFaq(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.deleteFaq(id.id, user_id);
  }

  // Gig Gallery end-points
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/:gig_id/gallery')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a Gig Gallery' })
  @ApiBody({ type: CreateGalleryDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigGallery(
    @Param('gig_id') gigId: number,
    @UploadedFile() image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateGalleryDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createGigGallery(
      gigId,
      data,
      image,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/:gig_id/gallery/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update gig Gallery' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig Gallery updated successfully',
  })
  async updateGigGallery(
    @Param('gig_id') gigId: number,
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body(ValidationPipe)
    updateData: UpdateGalleryDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.updateGigGallery(
      gigId,
      id,
      updateData,
      image,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/:gig_id/gallery')
  @ApiOperation({ summary: 'Get gig Gallery by gig ID' })
  async getGigGalleryByGigId(@Param('gig_id') gig_id: number): Promise<any> {
    return this.marketPlaceService.getGigGalleryByGigId(gig_id);
  }
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/gallery/:id')
  @ApiOperation({ summary: 'Delete Gallery by id' })
  async deleteGallery(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.deleteGallery(id.id, user_id);
  }

  // Gig Feedback end-points
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/:gig_id/feedback')
  @ApiOperation({ summary: 'Create a Gig Feedbacks' })
  @ApiBody({ type: CreateFeedbackDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigFeedback(
    @Body(ValidationPipe) data: CreateFeedbackDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createFeedback(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/:gig_id/feedback/:id')
  @ApiOperation({ summary: 'Update gig Feedback' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig Feedback updated successfully',
  })
  async updateGigFeedback(
    @Param('id') id: number,
    @Body(ValidationPipe)
    updateData: UpdateFeedbackDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.updateGigFeedback(id, updateData, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/:gig_id/feedback')
  @ApiOperation({ summary: 'Get gig Feedback by gig ID' })
  async getGigFeedbackByGigId(@Param('gig_id') gig_id: number): Promise<any> {
    return this.marketPlaceService.getGigFeedbackByGigId(gig_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/feedback/search')
  @ApiOperation({ summary: 'Get gig Feedback by gig ID' })
  async getGigFeedback(
    @Query() data: FeedbackFilterDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.getGigFeedback(data, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/popular-expertise/')
  @ApiOperation({ summary: 'Get popular expertise' })
  async getPopular(): Promise<any> {
    return this.marketPlaceService.getPopularExpertise();
  }

  @AllowUnauthorizedRequest()
  @Get('/open/user/expertise/')
  @ApiOperation({ summary: 'Get popular expertise' })
  async getExpertiseByUserId(@Query('user_id') user_id: number): Promise<any> {
    return this.marketPlaceService.getExpertiseByUserId(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/feedback/:id')
  @ApiOperation({ summary: 'Delete Feedback by id' })
  async deleteFeedback(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.deleteFeedback(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/popular-category/popular-category/popular-category')
  async getPopularCategory(): Promise<any> {
    return this.marketPlaceService.getPopularCategory();
  }

  @AllowUnauthorizedRequest()
  @Get('/open/popular-category')
  async getOpenPopularCategory(): Promise<any> {
    return this.marketPlaceService.getPopularCategory();
  }

  // Gig request
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/:gig_id/request')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('attachment'))
  @ApiOperation({ summary: 'Create gig request' })
  async createGigRequest(
    @Param('gig_id') gig_id: number,
    @UploadedFile() attachment: Express.Multer.File,
    @Body(ValidationPipe)
    data: CreateRequestDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createGigRequest(
      gig_id,
      data,
      attachment,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/:gig_id/request/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('attachment'))
  @ApiOperation({ summary: 'Update gig request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig Request updated successfully',
  })
  async updateGigRequest(
    @Param('gig_id') gig_id: number,
    @Param('id') id: number,
    @UploadedFile() attachment: Express.Multer.File,
    @Body(ValidationPipe)
    updateData: UpdateRequestDto,
  ): Promise<any> {
    return this.marketPlaceService.updateGigRequest(
      gig_id,
      id,
      updateData,
      attachment,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/:gig_id/request')
  @ApiOperation({ summary: 'Get gig request by gig ID' })
  async getGigRequestByGigId(@Param('gig_id') gig_id: number): Promise<any> {
    return this.marketPlaceService.getGigRequestByGigId(gig_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/:gig_id/request/filter')
  @ApiOperation({ summary: 'Get gig request by gig ID' })
  async getGigRequestByGigIdAndStatus(
    @Param('gig_id') gig_id: number,
    @Query() data: FilterRequestDataDto,
  ): Promise<any> {
    return this.marketPlaceService.getGigRequestByStatus(gig_id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/request/:id')
  @ApiOperation({ summary: 'Delete request by id' })
  async deleteRequest(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.deleteRequest(id.id, user_id);
  }

  // Gig reaction end-points
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/reaction')
  @ApiOperation({ summary: 'Create a Gig reaction' })
  @ApiBody({ type: CreateReactionDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigReaction(
    @Body(ValidationPipe) data: CreateReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createReaction(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/reaction/:id')
  @ApiOperation({ summary: 'Update gig reaction' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig reaction updated successfully',
  })
  async updateGigReaction(
    @Param('id') id: number,
    @Body(ValidationPipe)
    updateData: UpdateReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.updateGigReaction(id, updateData, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/:gig_id/reaction')
  @ApiOperation({ summary: 'Get gig reaction by gig ID' })
  async getGigReactionByGigId(@Param('gig_id') gig_id: number): Promise<any> {
    return this.marketPlaceService.getGigReactionByGigId(gig_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/reaction/:id')
  @ApiOperation({ summary: 'Delete reaction by id' })
  async deleteReaction(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.deleteReaction(id.id, user_id);
  }

  // Gig feedback reaction end-points
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/feedback/reaction')
  @ApiOperation({ summary: 'Create a Gig reaction' })
  @ApiBody({ type: CreateFeedbackReactionDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigFeedbackReaction(
    @Body(ValidationPipe) data: CreateFeedbackReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createFeedbackReaction(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/feedback/reaction/:id')
  @ApiOperation({ summary: 'Update gig reaction' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig reaction updated successfully',
  })
  async updateGigFeedbackReaction(
    @Param('id') id: number,
    @Body(ValidationPipe)
    updateData: UpdateFeedbackReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.updateFeedbackReaction(
      id,
      updateData,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/feedback/:feedback_id/reaction')
  @ApiOperation({ summary: 'Get gig reaction by gig ID' })
  async getReactionByFeedbackId(
    @Param('feedback_id') feedback_id: number,
  ): Promise<any> {
    return this.marketPlaceService.getReactionByFeedbackId(feedback_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/feedback/reaction/:id')
  @ApiOperation({ summary: 'Delete reaction by id' })
  async deleteFeedbackReaction(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.marketPlaceService.deleteFeedbackReaction(id.id, user_id);
  }

  // Gig request response
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/request-response')
  @ApiOperation({ summary: 'Create a Gig Request-response' })
  @ApiBody({ type: CreateRequestResponseDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigRequestResponse(
    @Body(ValidationPipe) data: CreateRequestResponseDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createGigRequestResponse(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/request-response/:id')
  @ApiOperation({ summary: 'Update gig request-response' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig Request-response updated successfully',
  })
  async updateGigRequestResponse(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe)
    updateData: UpdateRequestResponseDto,
  ): Promise<any> {
    return this.marketPlaceService.updateGigRequestResponse(id.id, updateData);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/:req_id/request-response')
  @ApiOperation({ summary: 'Get gig request-response by request ID' })
  async getGigRequestResponseByReqId(
    @Param('req_id') req_id: number,
    @Query('response_status') response_status: GIG_RESPONSE_STATUS,
  ): Promise<any> {
    return this.marketPlaceService.getGigRequestResponseByReqId(
      req_id,
      response_status,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/request-response/:gig_id')
  @ApiOperation({ summary: 'Get gig request-response by gig ID' })
  async getGigRequestResponseByGigId(
    @Param('gig_id') gig_id: number,
    @Query('response_status') response_status: GIG_RESPONSE_STATUS,
  ): Promise<any> {
    return this.marketPlaceService.getGigRequestResponseByGigId(
      gig_id,
      response_status,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/request-response/:id')
  @ApiOperation({ summary: 'Delete request-response by id' })
  async deleteRequestResponse(@Param() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.deleteRequestResponse(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig-payment')
  async createGigPayment(
    @Body(ValidationPipe) data: CreateGigPaymentDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createGigPayment(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/package/all-process')
  @ApiOperation({ summary: 'Gig Package' })
  @ApiBody({ type: PackageAllProcessDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async gigPackageAllProcess(
    @Body(ValidationPipe) data: PackageAllProcessDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.gigPackageAllProcess(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/faq/all-process')
  @ApiOperation({ summary: 'Gig Faq' })
  @ApiBody({ type: FaqAllProcessDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async gigFaqAllProcess(
    @Body(ValidationPipe) data: FaqAllProcessDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.gigFaqAllProcess(data, user_id);
  }
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/report')
  async createGigReport(
    @Body() data: createGigReportDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.createGigReport(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/report/:id')
  async updateGigReport(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateGigReportDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.marketPlaceService.updateGigReport(id.id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/gig/report/:id')
  async getGigReport(@Param() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.getGigReport(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/report/:id')
  async deleteGigReport(@Param() data: GetByIdDto): Promise<any> {
    return this.marketPlaceService.deleteGigReport(data.id);
  }
}
