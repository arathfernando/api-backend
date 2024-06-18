import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreateAdminUserDto,
  GetByIdDto,
  PaginationDto,
  UpdateAdminUserDto,
} from 'src/helper/dtos';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { AdminService } from './admin.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Admins')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @MessagePattern('update_admin_notification_status')
  public async updateAdminNotification(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.adminService.updateAdminNotification(data);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profile_image'))
  @Post()
  async createAdmin(
    @UploadedFile() profile_image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateAdminUserDto,
  ): Promise<any> {
    return await this.adminService.createAdmin(profile_image, data);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profile_image'))
  @Put('/:id')
  async updateAdmin(
    @UploadedFile() profile_image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateAdminUserDto,
  ): Promise<any> {
    return await this.adminService.updateAdmin(profile_image, data, id.id);
  }

  @Get()
  async getAllUsers(@Query() data: PaginationDto): Promise<any> {
    return await this.adminService.getAllUsers(data.limit, data.page);
  }

  @Get('/:id')
  async getUser(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminService.getUser(id.id);
  }

  @Delete('/:id')
  async deleteBasicType(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminService.deleteUser(id.id);
  }
}
