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
import {
  CreateTransactionDto,
  PaginationDto,
  UpdateTransactionDto,
} from 'src/core/dtos';
import { GetAnalyticsByTransactionTypeDto } from 'src/core/dtos/get-analytics-by-transaction-type.dto';
import { GetByTransactionTypeDto } from 'src/core/dtos/get-by-transaction-type.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { Transaction } from 'src/database/entities';
import { TransactionService } from './transaction.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @MessagePattern('create_admin_transaction')
  public async createToken(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.transactionService.createAdminTransaction(data, data.user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<Transaction[]> {
    return await this.transactionService.findAll(pagination, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Transaction> {
    return await this.transactionService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/transaction/analytics/')
  async getOverAllTransaction(
    @Query() data: GetAnalyticsByTransactionTypeDto,
    @CurrentUser() user_id: number,
  ): Promise<Transaction[]> {
    return await this.transactionService.findAnalyticsByTransactionType(
      data,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/transaction/user/:transaction_type')
  async getUserTransaction(
    @Query() data: GetByTransactionTypeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.transactionService.getUserTransaction(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/transaction/:transaction_type')
  async findByTransactionType(
    @Query() data: GetByTransactionTypeDto,
  ): Promise<any> {
    return await this.transactionService.findByTransactionType(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  async create(
    @Body(ValidationPipe) data: CreateTransactionDto,
    @CurrentUser() user_id: number,
  ): Promise<Transaction> {
    return await this.transactionService.create(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body(ValidationPipe) data: UpdateTransactionDto,
    @CurrentUser() user_id: number,
  ): Promise<Transaction> {
    return await this.transactionService.update(id, data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @CurrentUser() user_id: number,
  ): Promise<void> {
    return await this.transactionService.remove(id, user_id);
  }
}
