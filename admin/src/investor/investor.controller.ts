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
import { AllowUnauthorizedRequest } from 'src/helper/decorator/allow.unauthorized.decorator';
import {
  CreateZoneDTO,
  UpdateZoneDTO,
  CreateAreaDTO,
  UpdateAreaDTO,
  CreateAssignShareDTO,
  CreateAssignPriceDTO,
  GetAssignShareDto,
  GrabShareDTO,
  GetByIdDto,
  UpdateAssignShareDTO,
  UpdateAssignPriceDTO,
} from 'src/helper/dtos';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { InvestorService } from './investor.service';
import { GetUserAssignShareDto } from 'src/helper/dtos/get-user-assign-share.dto';
import { GetByIdOptionalDto } from 'src/helper/dtos/get-by-id-optional.dto';

@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@ApiTags('Investor')
@Controller('/admin/investor')
export class InvestorController {
  constructor(private investorService: InvestorService) {}

  @MessagePattern('get_zone')
  public async getZone(@Payload() id: number): Promise<any> {
    return await this.investorService.findOneZone(id);
  }

  @MessagePattern('get_zone_by_community_id')
  public async findOneZoneByCommunityId(
    @Payload() data: { id: number },
  ): Promise<any> {
    return await this.investorService.findOneZoneByCommunityId(data.id);
  }

  @MessagePattern('zone_share')
  public async zoneShare(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.investorService.zoneShare(data.id, data.user_id);
  }

  @MessagePattern('get_share_area')
  public async getShareArea(@Payload() data: any): Promise<any> {
    return await this.investorService.findOneShareArea(data);
  }

  @MessagePattern('get_assign_price')
  public async getSharePrice(@Payload() id: number): Promise<any> {
    return await this.investorService.findAssignPrice(id);
  }

  @MessagePattern('get_user_investment_zone_list')
  public async getUserInvestmentZoneList(@Payload() id: number): Promise<any> {
    return await this.investorService.getUserInvestmentZoneList(id);
  }

  @MessagePattern('get_user_investment_by_zone')
  public async getMediaData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.investorService.assignShareByUserAndZone(
      data.user_id,
      data.zone_id,
    );
  }

  @MessagePattern('get_user_investment_details')
  public async getUserInvestmentDetailsData(
    @Payload() data: any,
  ): Promise<any> {
    data = JSON.parse(data);
    return await this.investorService.getAssignShareByUser(data.id, data.data);
  }

  @MessagePattern('get_investor_by_zone')
  public async getInvestorByZone(@Payload() data: number): Promise<any> {
    return await this.investorService.getInvestorByZone(data);
  }

  @AllowUnauthorizedRequest()
  @Post('/grab-share')
  async grabShare(@Body(ValidationPipe) grabShareDTO: GrabShareDTO) {
    return await this.investorService.grabShare(grabShareDTO);
  }

  @Get('/zone')
  async findAll() {
    return await this.investorService.findAllZones();
  }

  @Get('/zone/:id')
  async findOne(@Param('id') id: number) {
    return await this.investorService.findOneZone(id);
  }

  @Post('/zone')
  async create(@Body(ValidationPipe) createZoneDto: CreateZoneDTO) {
    return await this.investorService.createZone(createZoneDto);
  }

  @Put('/zone/:id')
  async update(
    @Param('id') id: number,
    @Body(ValidationPipe) updateZoneDto: UpdateZoneDTO,
  ) {
    return await this.investorService.updateZone(id, updateZoneDto);
  }

  @Delete('/zone/:id')
  async delete(@Param('id') id: number) {
    return await this.investorService.deleteZone(id);
  }

  @Get('/share-area')
  async findAllAreas(@Query() id: GetByIdOptionalDto) {
    return await this.investorService.findAllAreas(id);
  }

  @Post('/share-area')
  async createArea(@Body(ValidationPipe) createAreaDto: CreateAreaDTO) {
    return await this.investorService.createArea(createAreaDto);
  }

  @Put('/share-area/:id')
  async updateShareArea(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateAreaDTO,
  ) {
    return await this.investorService.updateArea(id.id, data);
  }

  @Delete('/share-area/:id')
  async deleteShareArea(@Param() id: GetByIdDto) {
    return await this.investorService.deleteArea(id.id);
  }

  @Get('/assign-share')
  async findAllAssignShares(@Query() data: GetAssignShareDto) {
    return await this.investorService.findAllAssignShares(data);
  }

  @Get('/assign-share/user/:id')
  async findAllAssignShareByUser(
    @Param('id') id: number,
    @Query() data: GetUserAssignShareDto,
  ) {
    return await this.investorService.assignShareByUser(id, data);
  }

  @Post('/assign-share')
  async createAssignShare(
    @Body(ValidationPipe) createAssignShareDTO: CreateAssignShareDTO,
  ) {
    return await this.investorService.createAssignShare(createAssignShareDTO);
  }

  @Put('/assign-share/:id')
  async updateAssignShare(
    @Param('id') id: number,
    @Body(ValidationPipe) updateAssignShareDTO: UpdateAssignShareDTO,
  ) {
    return await this.investorService.updateAssignShare(
      id,
      updateAssignShareDTO,
    );
  }

  @Delete('/assign-share/:id')
  async deleteAssignShare(@Param('id') id: number) {
    return await this.investorService.deleteAssignShare(id);
  }

  @Get('/assign-price')
  async findAllAssignPrices(@Query() data: GetAssignShareDto) {
    return await this.investorService.findAllAssignPrices(data);
  }

  @Post('/assign-price')
  async createAssignPrice(
    @Body(ValidationPipe) createAssignPriceDto: CreateAssignPriceDTO,
  ) {
    return await this.investorService.createAssignPrice(createAssignPriceDto);
  }

  @Put('/assign-price/:id')
  async updateAssignPrice(
    @Param('id') id: number,
    @Body(ValidationPipe) updateAssignPriceDTO: UpdateAssignPriceDTO,
  ) {
    return await this.investorService.updateAssignPrice(
      id,
      updateAssignPriceDTO,
    );
  }

  @Delete('/assign-price/:id')
  async deleteAssignPrice(@Param('id') id: number) {
    return await this.investorService.deleteAssignPrice(id);
  }
}
