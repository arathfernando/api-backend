import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { CreateShareLocationDto } from 'src/core/dtos/location/create-share-location.dto';
import { UpdateShareLocationDto } from 'src/core/dtos/location/update-share-location.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { ShareLocationService } from './share-location.service';

@ApiTags('Community Share Location')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('share-location')
export class ShareLocationController {
  constructor(private readonly shareLocationService: ShareLocationService) {}

  @Post()
  async createLocationShare(
    @Body(ValidationPipe) data: CreateShareLocationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.shareLocationService.createLocationShare(data, user_id);
  }

  @Put('/:id')
  async updateLocationShare(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateShareLocationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.shareLocationService.updateLocationShare(
      id.id,
      data,
      user_id,
    );
  }

  @Get('/:id')
  async getLocationPostById(@Param() id: GetByIdDto): Promise<any> {
    return await this.shareLocationService.getLocationPostById(id.id);
  }

  @Delete('/:id')
  async deleteLocationPost(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.shareLocationService.deleteLocationPost(id.id, user_id);
  }
}
