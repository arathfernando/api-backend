import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AllowUnauthorizedRequest } from './helper/decorator/allow.unauthorized.decorator';
import { CurrentUser } from './helper/decorator/user.decorator';
import { LoginDto } from './helper/dtos';
import { ClientAuthGuard } from './helper/guards/auth.guard';
import { IAuthPayload } from './helper/interfaces';
import { ForgotPasswordDto } from './helper/dtos/forgot-password.dto';
import { ChangePasswordDto } from './helper/dtos/change-password.dto';
import { CreateAdminUserSignUpDto } from './helper/dtos/admin-signup.dto';
import { UpdateUserPasswordDto } from './helper/dtos/update-admin-password.dto';

@ApiTags('Admin Authentication')
@Controller('/admin')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @AllowUnauthorizedRequest()
  @Post('/login')
  adminLogin(@Body(ValidationPipe) data: LoginDto): Promise<IAuthPayload> {
    return this.appService.adminLogin(data);
  }

  @Post('2FA/login')
  admin2FALogin(@Body(ValidationPipe) data: LoginDto): Promise<IAuthPayload> {
    return this.appService.adminLogin(data);
  }

  @AllowUnauthorizedRequest()
  @Post('/signup')
  adminSignup(
    @Body(ValidationPipe) data: CreateAdminUserSignUpDto,
  ): Promise<IAuthPayload> {
    return this.appService.adminSignup(data);
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
  @Put('/change-password')
  changePassword(@Body(ValidationPipe) data: ChangePasswordDto): Promise<void> {
    return this.appService.changePassword(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/admin-users')
  async getUsers(@CurrentUser() user_id: number): Promise<any> {
    return await this.appService.getUsers(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/update-password')
  async updateUserPassword(
    @Body() data: UpdateUserPasswordDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.appService.updateUserPassword(data, user_id);
  }
}
