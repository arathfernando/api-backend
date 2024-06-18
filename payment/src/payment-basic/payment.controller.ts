import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { CreateUserBillingDto, UpdateUserBillingDto } from 'src/core/dtos';
import { CreatePaymentIntentDto } from 'src/core/dtos/course-payment-stripe.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { AllowUnauthorizedRequest } from 'src/core/helper/allow.unauthorized.decorator';
import { PaymentService } from './payment.service';
import { CreateEscrowTransactionDto } from 'src/core/dtos/escrow-transaction.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @AllowUnauthorizedRequest()
  @Post('/intent/success')
  async paymentIntentWebhook(@Body() data: any): Promise<any> {
    return await this.paymentService.paymentIntentWebhook(data);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/intent')
  async paymentIntent(@Body() data: CreatePaymentIntentDto): Promise<any> {
    return await this.paymentService.createPaymentIntent(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/user-billing')
  async createCoursePayment(
    @Body(ValidationPipe) data: CreateUserBillingDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.paymentService.createUserBilling(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/user-billing')
  async updateCoursePayment(
    @Body(ValidationPipe) data: UpdateUserBillingDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.paymentService.updateUserBilling(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user-billing')
  async getUserBilling(@CurrentUser() user_id: number): Promise<any> {
    return await this.paymentService.getUserBillingByUserId(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/user-billing')
  async deleteCoursePayment(@CurrentUser() user_id: number): Promise<any> {
    return await this.paymentService.deleteUserBilling(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/escrow-transaction')
  async createEscrowTransaction(
    @Body() data: CreateEscrowTransactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.paymentService.createEscrowTransaction(data, user_id);
  }
}
