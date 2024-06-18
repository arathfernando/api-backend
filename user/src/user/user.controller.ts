import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountSetting } from 'src/helper/decorator/account-setting.decorator';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { UserService } from './user.service';
import {
  CreateSettingDto,
  CloseAccountDto,
  SearchUserDto,
  GetUsersForSiteDto,
  VerifyAccountDto,
  UpdateUserPasswordDto,
  UpdateUserEmailDto,
  UpdateUserFcmTokenDto,
  MergeAccountDto,
} from '../helper/dtos';
import { Cron } from '@nestjs/schedule';
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Cron('0 0 * * *')
  public async handleCron() {
    await this.userService.cronMergeUserAccount();
  }
  @Get('/hubber-team')
  async getHubberUser(): Promise<any> {
    return this.userService.getHubberUser();
  }

  @Get('/community-host')
  async getCommunityHost(): Promise<any> {
    return this.userService.getCommunityHost();
  }

  @Get('/hubber-users')
  async getHubberUsers(@Query() data: GetUsersForSiteDto): Promise<any> {
    return this.userService.getHubberUsers(data);
  }

  @Get('/goals')
  async getAdminGoals(): Promise<any> {
    return this.userService.getAdminGoals();
  }

  @Get('/popular-contest')
  async getPopularContest(): Promise<any> {
    return this.userService.getPopularContest();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/add-default-settings')
  async addDefaultSettings(): Promise<any> {
    return this.userService.addDefaultSettings();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/default-settings')
  async getDefaultSettings(): Promise<any> {
    return this.userService.getDefaultSettings();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all/settings')
  async getAllSettings(@AccountSetting() data: any): Promise<any> {
    return data;
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/settings')
  async addSettings(
    @Body() data: CreateSettingDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.userService.saveAccountSetting(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/settings')
  async updateSettings(
    @Body() data: CreateSettingDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.userService.updateAccountSetting(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/close')
  async closeAccount(
    @Body() data: CloseAccountDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.userService.closeAccount(user_id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/search')
  async searchUser(@Query() data: SearchUserDto): Promise<any> {
    return await this.userService.searchUser(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/update-password')
  async updateUserPassword(
    @Body() data: UpdateUserPasswordDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.userService.updateUserPassword(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/update-fcm-token')
  async updateUserFcmToken(
    @Body() token: UpdateUserFcmTokenDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.userService.updateUserFcmToken(token.token, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/update-email')
  async updateUserEmail(
    @Body() data: UpdateUserEmailDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.userService.updateUserEmail(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/update-email/verify')
  async updateUserEmailVerify(
    @Body(ValidationPipe) data: VerifyAccountDto,
  ): Promise<any> {
    return await this.userService.updateUserEmailVerify(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/merge-account')
  async mergeUserAccount(
    @Body(ValidationPipe) data: MergeAccountDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.userService.mergeUserAccount(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/delete-account')
  async deleteUserAccount(@CurrentUser() user_id: number): Promise<any> {
    return await this.userService.deleteUserAccount(user_id);
  }
}
