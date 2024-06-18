import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import {
  GetByIdDto,
  InvestorDto,
  InviteInvestorDto,
  PaginationDto,
  UpdateInvestorDto,
  InvestorFilterDto,
} from 'src/helper/dtos';
import { InvestorService } from './investor.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';

@ApiTags('Investor Profile')
@Controller('/profile/investor')
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @MessagePattern('update_investor_profile')
  public async updateProfileForAdmin(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.id;
    delete data.id;
    return await this.investorService.updateProfile(user_id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  async createProfile(
    @Body(ValidationPipe) data: InvestorDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.investorService.createProfile(user, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put()
  async updateProfile(
    @Body(ValidationPipe) data: UpdateInvestorDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.investorService.updateProfile(user, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  async getProfile(@Query() data: PaginationDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.investorService.getProfile(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/myInvestment/details')
  async getUSerInvestmentDetails(
    @Query() data: InvestorFilterDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.investorService.getUserInvestmentDetails(user_id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/my-investment/:id')
  async getMyInvestment(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.investorService.getMyInvestment(user_id, id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/zone-investor/share/')
  async getShare(
    @Query() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.investorService.getShare(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/zone-investor/:id')
  async getInvestorByZone(@Param() id: GetByIdDto): Promise<any> {
    return await this.investorService.getZoneInvestor(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community')
  async getUserInvestmentCommunity(
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.investorService.getUserInvestmentCommunity(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/invite')
  async inviteInvestor(
    @Body(ValidationPipe) data: InviteInvestorDto,
    @CurrentUser() user: number,
  ): Promise<any> {
    return this.investorService.inviteInvestor(user, data);
  }

  @Get('/open/count')
  async getUserInvestmentCount(): Promise<any> {
    return await this.investorService.getUserInvestmentCount();
  }
}
