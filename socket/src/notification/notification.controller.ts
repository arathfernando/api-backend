import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Put,
  UseGuards,
  ValidationPipe,
  Delete,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import {
  CreateTestNotificationDto,
  GetByIdDto,
  GetNotificationByStatusDto,
  PaginationDto,
} from 'src/core/dtos';
import { UpdateNotificationDto } from 'src/core/dtos/update-notification.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { NotificationService } from './notification.service';
@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('pending_notifications')
  public async getPendingNotifications(@Payload() data: any): Promise<any> {
    return this.notificationService.getPendingNotifications(data);
  }

  @MessagePattern('mark_seen')
  public async markAsSeen(@Payload() id: any): Promise<any> {
    return this.notificationService.markAsSeen(id);
  }

  @MessagePattern('create_notification')
  public async createNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.notificationService.createNotification(data);
  }

  @MessagePattern('create_global_notification')
  public async createGlobalNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.notificationService.createGlobalNotification(data);
  }

  @MessagePattern('get_user_notification')
  public async getUserNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.notificationService.getAllUserNotification(0, data);
  }
  @MessagePattern('get_all_notification')
  public async getAllNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.notificationService.getAllNotification(data);
  }

  @MessagePattern('get_course_notification')
  public async getCourseNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    const user_id = data.user_id;
    return this.notificationService.getCourseNotification(data, user_id);
  }

  @MessagePattern('delete_user_notification')
  public async deleteUserNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.notificationService.deleteNotification(data);
  }

  @MessagePattern('delete_user_all_notification')
  public async deleteUserAllNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.notificationService.deleteAllNotification(data);
  }

  @MessagePattern('update_user_all_notification')
  public async updateUserAllNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.notificationService.updateAllNotification(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  public async createTest(
    @Body() data: CreateTestNotificationDto,
  ): Promise<any> {
    return this.notificationService.createNotification(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id')
  public async updateNotification(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateNotificationDto,
  ): Promise<any> {
    return this.notificationService.updateNotification(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:user_id/:status')
  public async getUserNotificationByStatus(
    @Param() data: GetNotificationByStatusDto,
  ): Promise<any> {
    return this.notificationService.getUserNotificationByStatus(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  public async getAllUserNotification(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.notificationService.getAllUserNotification(user_id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  public async deleteNotification(@Param() data: GetByIdDto): Promise<any> {
    return this.notificationService.deleteNotification(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/message-notifications')
  public async getAllMessageNotification(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.notificationService.getAllMessageNotification(user_id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/remove/message-notifications')
  public async deleteAllMessageNotification(
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.notificationService.deleteAllMessageNotification(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('mark-all-read/message-notifications')
  public async updateAllMessageNotification(
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.notificationService.updateAllMessageNotification(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete()
  public async deleteAllNotification(
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.notificationService.deleteAllNotification(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put()
  public async updateAllNotification(
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.notificationService.updateAllNotification(user_id);
  }
}
