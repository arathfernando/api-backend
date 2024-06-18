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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreateCommunityEventDto,
  EventSpeakerDto,
  GetByIdDto,
  PaginationDto,
  UpdateCommunityEventDto,
  UpdateEventSpeakerDto,
  UpdateEventStatusDto,
} from 'src/helper/dtos';
import {
  EventLectureDto,
  UpdateEventLectureDto,
} from 'src/helper/dtos/event-lecture.dto';
import {
  EventTimingDto,
  UpdateEventTimingDto,
} from 'src/helper/dtos/event-timing.dto';
import { GetEventByStatus } from 'src/helper/dtos/get-event-status.dto';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { CommunityEventService } from './community-event.service';

@ApiTags('Admin Community Events')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/community-event')
export class CommunityEventController {
  constructor(private readonly communityEventService: CommunityEventService) {}

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @Post()
  async createCommunityEvent(
    @UploadedFile() cover: Express.Multer.File,
    @Body(ValidationPipe) data: CreateCommunityEventDto,
  ): Promise<any> {
    return await this.communityEventService.createCommunityEvent(cover, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/event-speaker')
  @ApiBody({
    type: EventSpeakerDto,
    isArray: true,
  })
  async createEventSpeaker(
    @Body(ValidationPipe) data: EventSpeakerDto[],
  ): Promise<any> {
    return await this.communityEventService.createEventSpeaker(data);
  }

  @Get('/event-speaker/:id')
  async getEventSpeaker(
    @Param() event_id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      event_id: event_id.id,
      take: data.limit,
      skip,
    };
    return await this.communityEventService.getEventSpeaker(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/event-speaker/')
  @ApiBody({
    type: UpdateEventSpeakerDto,
    isArray: true,
  })
  async updateEventSpeaker(
    @Body(ValidationPipe) data: UpdateEventSpeakerDto[],
  ): Promise<any> {
    return await this.communityEventService.updateEventSpeaker(data);
  }

  @Delete('/event-speaker/:id')
  async deleteEventSpeaker(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityEventService.deleteEventSpeaker(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/event-timing')
  @ApiBody({
    type: EventTimingDto,
    isArray: true,
  })
  async createEventTiming(
    @Body(ValidationPipe) data: EventTimingDto[],
  ): Promise<any> {
    return await this.communityEventService.createEventTiming(data);
  }

  @Get('/event-timing/:id')
  async getEventTiming(
    @Param() event_id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      event_id: event_id.id,
      take: data.limit,
      skip,
    };
    return await this.communityEventService.getEventTiming(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/event-timing/')
  @ApiBody({
    type: UpdateEventTimingDto,
    isArray: true,
  })
  async updateEventTiming(
    @Body(ValidationPipe) data: UpdateEventTimingDto[],
  ): Promise<any> {
    return await this.communityEventService.updateTiming(data);
  }

  @Delete('/event-timing/:id')
  async deleteTiming(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityEventService.deleteTiming(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/event-lecture')
  @ApiBody({
    type: EventLectureDto,
    isArray: true,
  })
  async createEventLecture(
    @Body(ValidationPipe) data: EventLectureDto[],
  ): Promise<any> {
    return await this.communityEventService.createEventLecture(data);
  }

  @Get('/event-lecture/:id')
  async getEventLecture(
    @Param() event_id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      event_id: event_id.id,
      take: data.limit,
      skip,
    };
    return await this.communityEventService.getEventLecture(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/event-lecture/')
  @ApiBody({
    type: UpdateEventLectureDto,
    isArray: true,
  })
  async updateEventLecture(
    @Body(ValidationPipe) data: UpdateEventLectureDto[],
  ): Promise<any> {
    return await this.communityEventService.updateLecture(data);
  }

  @Delete('/event-lecture/:id')
  async deleteLecture(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityEventService.deleteLecture(id.id);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover_image'))
  @Put('/:id')
  async updateCommunityEvent(
    @UploadedFile() cover_image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCommunityEventDto,
  ): Promise<any> {
    return await this.communityEventService.updateCommunityEvent(
      data,
      id.id,
      cover_image,
    );
  }

  @Get()
  async getAllCommunityEvents(@Query() data: PaginationDto): Promise<any> {
    return await this.communityEventService.getAllCommunityEvents(
      data.limit,
      data.page,
    );
  }

  @Get('/:id')
  async getCommunityEvent(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityEventService.getCommunityEvent(id.id);
  }

  @Get('/community/:id')
  async getCommunityEventByCommunity(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityEventService.getCommunityEventByCommunity(id.id);
  }

  @Delete('/:id')
  async deleteCommunityEvent(@Param() id: GetByIdDto): Promise<any> {
    return await this.communityEventService.deleteCommunityEvent(id.id);
  }

  @Get('/status/:status')
  async getCommunityEventByStatus(
    @Param() status: GetEventByStatus,
  ): Promise<any> {
    return await this.communityEventService.getCommunityEventByStatus(status);
  }

  @Put('status/:id')
  async updateEventStatus(
    @Param() id: GetByIdDto,
    @Body() status: UpdateEventStatusDto,
  ): Promise<any> {
    return await this.communityEventService.updateCommunityEventStatus(
      id,
      status,
    );
  }
}
