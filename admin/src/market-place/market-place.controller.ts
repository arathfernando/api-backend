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
import { GetByIdDto, PaginationDto } from 'src/helper/dtos';
import { CreateFaqDto } from 'src/helper/dtos/market-place/create-faq.dto';
import { CreateGalleryDto } from 'src/helper/dtos/market-place/create-gallery.dto';
import { CreateGigDto } from 'src/helper/dtos/market-place/create-gig.dto';
import { CreatePackageDto } from 'src/helper/dtos/market-place/create-package.dto';
import { CreateRequestDto } from 'src/helper/dtos/market-place/create-request.dto';
import { CreateGigCategoryDto } from 'src/helper/dtos/market-place/gig-category.dto';
import {
  CreateRequestResponseDto,
  GIG_RESPONSE_STATUS,
  UpdateRequestResponseDto,
} from 'src/helper/dtos/market-place/req-res.dto';
import { UpdateFaqDto } from 'src/helper/dtos/market-place/update-faq.dto';
import { UpdateGalleryDto } from 'src/helper/dtos/market-place/update-gallery.dto';
import { UpdateGigCategoryDto } from 'src/helper/dtos/market-place/update-gig-category.dto';
import { UpdateGigDto } from 'src/helper/dtos/market-place/update-gig.dto';
import { UpdatePackageDto } from 'src/helper/dtos/market-place/update-package.dto';
import { UpdateRequestDto } from 'src/helper/dtos/market-place/update-request.dto';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { MarketPlaceService } from './market-place.service';
import { CreateFeedbackDto } from 'src/helper/dtos/market-place/create-feedback.dto';
import { UpdateFeedbackDto } from 'src/helper/dtos/market-place/update-feedback.dto';

@ApiTags('Market Place')
@Controller('/admin/market-place')
export class MarketPlaceController {
  constructor(private readonly marketPlaceService: MarketPlaceService) {}

  // Gig category
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/category')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateGigCategoryDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createCategory(
    @UploadedFile() cover: Express.Multer.File,
    @Body(ValidationPipe) data: CreateGigCategoryDto,
  ): Promise<any> {
    return await this.marketPlaceService.createCategory(data, cover);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/category/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Update gig category by ID' })
  async updateGigCategory(
    @UploadedFile() cover: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateGigCategoryDto,
  ): Promise<any> {
    return this.marketPlaceService.updateGigCategory(id.id, data, cover);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  async getGigCategoryById(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.getGigCategoryById(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/category')
  @ApiOperation({ summary: 'Get all category' })
  async getGigAllCategory(): Promise<any> {
    return this.marketPlaceService.getGigAllCategory();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/category/:id')
  @ApiOperation({ summary: 'Delete category by ID' })
  async deleteGigCategory(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.deleteGigCategory(id);
  }

  // Gig project
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new gig' })
  @ApiBody({ type: CreateGigDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGig(@Body(ValidationPipe) data: CreateGigDto): Promise<any> {
    return await this.marketPlaceService.createGig(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update gig by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig updated successfully',
  })
  async updateGig(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe)
    data: UpdateGigDto,
  ): Promise<any> {
    return this.marketPlaceService.updateGig(id.id, data);
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
  @Get(':id')
  @ApiOperation({ summary: 'Get gig by ID' })
  async getGigById(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.getGigById(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete gig by ID' })
  async deleteGig(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.deleteGig(id);
  }

  // Gig packages end points
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/:gig_id/package')
  @ApiOperation({ summary: 'Create a Gig Package' })
  @ApiBody({ type: [CreatePackageDto] })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigPackage(
    @Body(ValidationPipe) data: CreatePackageDto[],
  ): Promise<any> {
    return await this.marketPlaceService.createPackage(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/:gig_id/package/:id')
  @ApiOperation({ summary: 'Update gig package' })
  @ApiBody({ type: [UpdatePackageDto] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gig updated successfully',
  })
  async updateGigPackage(
    @Body(ValidationPipe) updateData: UpdatePackageDto[],
  ): Promise<any> {
    return this.marketPlaceService.updateGigPackage(updateData);
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
  async deletePackage(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.deletePackage(id);
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
  ): Promise<any> {
    return await this.marketPlaceService.createGigGallery(gigId, data, image);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/gig/:gig_id/gallery/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update gig Gallery' })
  async updateGigGallery(
    @Param('gig_id') gigId: number,
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body(ValidationPipe)
    updateData: UpdateGalleryDto,
  ): Promise<any> {
    return this.marketPlaceService.updateGigGallery(
      gigId,
      id,
      updateData,
      image,
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
  async deleteGallery(@Param('id') id: number): Promise<any> {
    return this.marketPlaceService.deleteGallery(id);
  }

  // Gig request
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/gig/:gig_id/request')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('attachment'))
  @ApiOperation({ summary: 'Create a Gig Request' })
  @ApiBody({ type: CreateRequestDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async createGigRequest(
    @Param('gig_id') gig_id: number,
    @UploadedFile() attachment: Express.Multer.File,
    @Body(ValidationPipe) data: CreateRequestDto,
  ): Promise<any> {
    return await this.marketPlaceService.createGigRequest(
      gig_id,
      data,
      attachment,
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
  @Delete('/gig/request/:id')
  @ApiOperation({ summary: 'Delete request by id' })
  async deleteRequest(@Param() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.deleteRequest(id.id);
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
  ): Promise<any> {
    return await this.marketPlaceService.createGigRequestResponse(data);
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
  @Delete('/gig/request-response/:id')
  @ApiOperation({ summary: 'Delete request-response by id' })
  async deleteRequestResponse(@Param() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.deleteRequestResponse(id.id);
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
  async createGigFaq(@Body(ValidationPipe) data: CreateFaqDto[]): Promise<any> {
    return await this.marketPlaceService.createFaq(data);
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
  ): Promise<any> {
    return this.marketPlaceService.updateGigFaq(updateData);
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
  async deleteFaq(@Param() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.deleteFaq(id.id);
  }

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
  ): Promise<any> {
    return await this.marketPlaceService.createFeedback(data);
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
  ): Promise<any> {
    return this.marketPlaceService.updateGigFeedback(id, updateData);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all/feedback')
  async getAllFeedback(@Query() data: PaginationDto): Promise<any> {
    return await this.marketPlaceService.getAllFeedback(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/gig/feedback/:id')
  @ApiOperation({ summary: 'Delete Feedback by id' })
  async deleteFeedback(@Param() id: GetByIdDto): Promise<any> {
    return this.marketPlaceService.deleteFeedback(id.id);
  }
}
