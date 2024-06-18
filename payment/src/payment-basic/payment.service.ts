import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Service } from 'src/core/services/s3/s3.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from 'src/core/dtos/course-payment-stripe.dto';
import { PaymentTransaction } from 'src/database/entities/payment_transaction.entity';
import { CreateUserBillingDto } from 'src/core/dtos';
import { UserBilling } from 'src/database/entities';
import { CreateEscrowTransactionDto } from 'src/core/dtos/escrow-transaction.dto';
import { EscrowTransaction } from 'src/database/entities/escrow_transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class PaymentService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    private readonly stripe: Stripe,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(EscrowTransaction)
    private readonly escrowTransactionRepository: Repository<EscrowTransaction>,
    @InjectRepository(UserBilling)
    private readonly userBillingRepository: Repository<UserBilling>,
  ) {
    this.stripe = new Stripe(this.configService.get('stripe.secret_key'), {
      apiVersion: '2022-11-15',
    });
  }

  public async getUser(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_id', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  public async createPaymentIntent(data: CreatePaymentIntentDto): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        automatic_payment_methods: { enabled: true },
        metadata: JSON.parse(data.metaData),
      });
      return paymentIntent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createEscrowTransaction(
    data: CreateEscrowTransactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const escrowTransaction = new EscrowTransaction();
      escrowTransaction.created_by = user_id;
      escrowTransaction.transaction_amount = data.transaction_amount;
      escrowTransaction.transaction_details = data.transaction_details;
      escrowTransaction.transaction_from = data.transaction_from;
      escrowTransaction.transaction_from_payment_id =
        data.transaction_from_payment_id;
      escrowTransaction.transaction_from_type = data.transaction_from_type;
      escrowTransaction.transaction_to = data.transaction_to;
      escrowTransaction.transaction_to_type = data.transaction_to_type;
      await this.escrowTransactionRepository.save(escrowTransaction);
      return {
        status: 200,
        message: 'payment created successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async paymentIntentWebhook(data: any): Promise<any> {
    try {
      const paymentTransaction = new PaymentTransaction();
      paymentTransaction.webhook_response = data;
      await this.paymentTransactionRepository.save(paymentTransaction);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createUserBilling(
    data: CreateUserBillingDto,
    user_id: number,
  ): Promise<any> {
    try {
      const user = await this.getUser(user_id);
      if (!user) {
        return {
          status: '500',
          message: 'No user found',
        };
      }
      const checkUserBilling = await this.userBillingRepository.findOne({
        where: {
          user_id: user_id,
        },
      });
      if (checkUserBilling) {
        return {
          status: 500,
          message: 'User billing already exist.',
        };
      }
      const userBilling = new UserBilling();
      userBilling.first_name = data.first_name;
      userBilling.last_name = data.last_name;
      userBilling.address = data.address;
      userBilling.country = data.country;
      userBilling.state = data.state;
      userBilling.postcode = data.postcode;
      userBilling.company = data.company;
      userBilling.user_id = user_id;
      await this.userBillingRepository.save(userBilling);
      return userBilling;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserBilling(data: any, user_id: number): Promise<any> {
    try {
      const userBilling = await this.userBillingRepository.findOne({
        where: {
          user_id: user_id,
        },
      });
      if (!userBilling) {
        return {
          status: 500,
          message: 'No user billing found.',
        };
      }
      await this.userBillingRepository.update(userBilling.id, data);
      return {
        status: 200,
        message: 'User Billing Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserBillingByUserId(user_id: number): Promise<any> {
    try {
      const payment = await this.userBillingRepository.findOne({
        where: {
          user_id: user_id,
        },
      });
      if (!payment) {
        return {
          status: 500,
          message: 'No user billing found.',
        };
      }
      return payment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteUserBilling(user_id: number): Promise<any> {
    try {
      const payment = await this.userBillingRepository.findOne({
        where: {
          user_id: user_id,
        },
      });
      if (!payment) {
        return {
          status: 500,
          message: 'No user billing found.',
        };
      }
      await this.userBillingRepository.delete(payment.id);
      return {
        status: 200,
        message: 'User billing deleted.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
