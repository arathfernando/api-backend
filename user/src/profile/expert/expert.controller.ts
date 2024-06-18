/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import {
  CreateUserPortFolioDTO,
  ExpertDto,
  GetByIdDto,
  GetByIdOptionalDto,
  UpdateExpertDto,
  UpdateUserPortFolioDTO,
  ExpertReviewFilterDto,
  CreateExpertProfileReactionDto,
  UpdateExpertProfileReactionDto,
  ExpertFilterDto,
} from 'src/helper/dtos';
import { ExpertService } from './expert.service';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';

@ApiTags('Expert Profile')
@ApiBearerAuth()
@Controller('/profile/expert')
export class ExpertController {
  constructor(private readonly expertService: ExpertService) {}

  @MessagePattern('get_expert')
  public async getAllExpert(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.expertService.getAllExpert(data);
  }

  @MessagePattern('update_expert_profile')
  public async updateProfileForAdmin(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.id;
    delete data.id;
    return await this.expertService.updateProfile(user_id, data);
  }

  @Post()
  async createProfile(
    @Body(ValidationPipe) data: ExpertDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.expertService.createProfile(user, data);
  }

  @Put()
  async updateProfile(
    @Body(ValidationPipe) data: UpdateExpertDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.expertService.updateProfile(user, data);
  }

  @Get('/all')
  async getAllProfile(
    @Query() data: ExpertFilterDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return this.expertService.getAllProfile(data, newD, user);
  }

  @Get('/:id')
  async getUserProfile(
    @Param() data: GetByIdDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.expertService.getExpertProfile(data.id, user);
  }

  @Get()
  async getProfile(@CurrentUser() user: number): Promise<any> {
    return this.expertService.getProfile(user);
  }

  @Post('/portfolio')
  async createExpertPortfolio(
    @Body() data: CreateUserPortFolioDTO,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.expertService.createExpertPortfolio(user, data);
  }

  @Get('/portfolio/:id')
  async getExpertPortfolioById(
    @Param() id: GetByIdDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.expertService.getExpertPortfolioById(id.id, user);
  }

  @Put('/portfolio/:id')
  async updateExpertPortfolio(
    @Param() id: GetByIdDto,
    @Body() data: UpdateUserPortFolioDTO,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.expertService.updateExpertPortfolio(id.id, user, data);
  }

  @Get('/portfolio/user/:user_id')
  async getAllExpertPortfolio(
    @Param() user_id: GetByIdOptionalDto,
  ): Promise<any> {
    return this.expertService.getAllExpertPortfolio(user_id.user_id);
  }

  @Delete('/portfolio/:id')
  async deleteExpertPortfolioById(
    @Param() id: GetByIdDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.expertService.deleteExpertPortfolio(id.id, user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/reaction')
  async createExpertProfileReaction(
    @Body(ValidationPipe) data: CreateExpertProfileReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.expertService.createExpertProfileReaction(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/reaction/:id')
  async updateExpertProfileReaction(
    @Body(ValidationPipe) data: UpdateExpertProfileReactionDto,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.expertService.updateExpertProfileReaction(data, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/reaction/:id')
  async deleteExpertProfileReactionById(@Param() id: GetByIdDto): Promise<any> {
    return await this.expertService.deleteExpertProfileReactionById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/reaction/:id')
  async getExpertProfileReactionById(@Param() id: GetByIdDto): Promise<any> {
    return await this.expertService.getExpertProfileReactionById(id.id);
  }

  @Get('review/profile/:user_id')
  async getUserProfileReview(
    @Param('user_id') id: number,
    @Query() data: ExpertReviewFilterDto,
  ): Promise<any> {
    return this.expertService.getUserProfileReview(id, data);
  }
}
