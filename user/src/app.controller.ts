import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Render,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { USER_CREATED_BY, USER_STATE } from './helper/constant';
import { AllowUnauthorizedRequest } from './helper/decorator/allow.unauthorized.decorator';
import {
  ChangePasswordDto,
  CreateUserDto,
  ForgotPasswordDto,
  AppleDto,
  GetByIdDto,
  LinkedinDto,
  LoginDto,
  VerifyAccountDto,
  updateUserDto,
} from './helper/dtos';
import { IAuthPayload, IGetUserById } from './helper/interfaces';
import { ClientAuthGuard } from './helper/guards/auth.guard';

@Controller('/auth')
@ApiTags('Authentication')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('add_user')
  public async createUser(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    data.user_created_by = USER_CREATED_BY.ADMIN;
    return this.appService.createUser(data);
  }

  @MessagePattern('update_user')
  public async updateUser(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.appService.updateUser(data);
  }

  @MessagePattern('update_user_notification_status')
  public async updateUserNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.appService.updateUserNotification(data);
  }

  @MessagePattern('update_user_chat_status')
  public async updateUserChat(@Payload() data: number): Promise<any> {
    return this.appService.updateUserChat(data);
  }

  @MessagePattern('get_all_users')
  public async allUsers(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.appService.allUsers(data);
  }

  @MessagePattern('get_user_with_profile')
  public async getUserProfileById(
    @Payload() data: { userId: number },
  ): Promise<IGetUserById> {
    return this.appService.getUserProfileById(data.userId);
  }

  @MessagePattern('get_user_by_id')
  public async getUserById(
    @Payload() data: { userId: number },
  ): Promise<IGetUserById> {
    return this.appService.getUserById(data.userId);
  }

  @MessagePattern('get_user_setting_by_id')
  public async getUserSettingById(@Payload() id: number): Promise<any> {
    return this.appService.getUserSettingById(id);
  }

  @MessagePattern('delete_user')
  public async deleteUser(@Payload() data: { userId: number }): Promise<any> {
    return this.appService.deleteUser(data.userId);
  }

  @MessagePattern('get_user_interests')
  public async getUserInterests(@Payload() data: any): Promise<any> {
    return this.appService.getUserInterests(data.userId);
  }

  @MessagePattern('get_user_by_email')
  public async getUserByEmail(
    @Payload() data: { email: string },
  ): Promise<any> {
    return this.appService.getUserByEmail(data.email);
  }

  @MessagePattern('change_user_chat_status')
  public async changeUserChatStatus(
    @Payload() data: { userId: number; status: USER_STATE },
  ): Promise<any> {
    return this.appService.changeUserChatStatus(data.userId, data.status);
  }

  @MessagePattern('claim_prize_generate_code')
  public async claimPrizeGenerateCode(@Payload() data: any): Promise<any> {
    return this.appService.generateCode(data);
  }

  @MessagePattern('verify_generated_code')
  public async verifyGeneratedCode(@Payload() data: any): Promise<any> {
    return this.appService.verifyGeneratedCode(data);
  }

  @AllowUnauthorizedRequest()
  @Post('/login')
  login(@Body(ValidationPipe) data: LoginDto): Promise<IAuthPayload> {
    return this.appService.login(data);
  }

  @AllowUnauthorizedRequest()
  @Post('/signup')
  signup(@Body(ValidationPipe) data: CreateUserDto): Promise<IAuthPayload> {
    return this.appService.signup(data);
  }

  @AllowUnauthorizedRequest()
  @Get('/signup/linkedin')
  @Render('linkedin')
  linkedin(@Query(ValidationPipe) data: LinkedinDto): Promise<any> {
    return this.appService.performLinkedinLogin(data);
  }

  @AllowUnauthorizedRequest()
  @Get('/signup/mobile/linkedin')
  @Render('linkedin')
  mobileLinkedin(@Query(ValidationPipe) data: LinkedinDto): Promise<any> {
    return this.appService.performLinkedinLoginMobile(data);
  }

  @AllowUnauthorizedRequest()
  @Get('/signup/mobile/apple')
  mobileApple(@Query(ValidationPipe) data: AppleDto): Promise<any> {
    return this.appService.performAppleLoginMobile(data);
  }

  @AllowUnauthorizedRequest()
  @Post('/forgot-password')
  getForgotPassword(
    @Body(ValidationPipe) data: ForgotPasswordDto,
    @Res() res,
  ): Promise<void> {
    this.appService.getForgotPasswordToken(data);

    return res.status(HttpStatus.OK).json({
      message: 'Forgot Password token sent',
      status: 200,
    });
  }

  @AllowUnauthorizedRequest()
  @Post('/get-verification-code')
  async sendVerificationCode(@Body(ValidationPipe) data: ForgotPasswordDto) {
    return await this.appService.sendAccountVerificationCode(data);
  }

  @AllowUnauthorizedRequest()
  @Post('/verify-account')
  async verifyAccount(@Body(ValidationPipe) data: VerifyAccountDto) {
    return await this.appService.verifyAccount(data.token);
  }

  @AllowUnauthorizedRequest()
  @Put('/change-password')
  changePassword(@Body(ValidationPipe) data: ChangePasswordDto): Promise<void> {
    return this.appService.changePassword(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/user/:id')
  async updateUserData(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: updateUserDto,
  ): Promise<any> {
    return this.appService.updateUserData(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user/check-ai/:id')
  async checkUserAI(@Param() id: GetByIdDto): Promise<any> {
    return this.appService.checkUserAi(id.id);
  }
}
