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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AllowUnauthorizedRequest } from 'src/core/decorator/allow.unauthorized.decorator';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { AllowEventDto } from 'src/core/dtos/community-event/allow-in-event.dto';
import { EventAttendeeStatusDto } from 'src/core/dtos/community-event/attendee-status.dto';
import { CommunityEventDto } from 'src/core/dtos/community-event/community-event.dto';
import {
  EventLectureDto,
  UpdateEventLectureDto,
} from 'src/core/dtos/community-event/event-lecture.dto';
import {
  EventSpeakerDto,
  UpdateEventSpeakerDto,
} from 'src/core/dtos/community-event/event-speaker.dto';
import {
  EventTimingDto,
  UpdateEventTimingDto,
} from 'src/core/dtos/community-event/event-timing.dto';
import { EventTypeDto } from 'src/core/dtos/community-event/event-type.dto';
import { InviteUsersToEventDto } from 'src/core/dtos/community-event/invite-user-event.dto';
import { SearchDataQueryEventDto } from 'src/core/dtos/community-event/search-data-query.dto';
import { UpdateCommunityEventDto } from 'src/core/dtos/community-event/update-community-event.dto';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { SearchDatasDto } from 'src/core/dtos/searchdata.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { CommunityEventService } from './community-event.service';

@ApiTags('Community Event')
@Controller('community-event')
export class CommunityEventController {
  constructor(private readonly communityEventService: CommunityEventService) {}

  @MessagePattern('add_community_event')
  public async createCommunityEventData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.communityEventService.createEvent(
      data,
      data.cover_img,
      data.created_by,
    );
  }

  @MessagePattern('add_community_speaker')
  public async createCommunityEventSpeaker(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.communityEventService.createEventSpeaker(data);
  }

  @MessagePattern('get_community_event_speaker_by_id')
  public async getSpeakerDataById(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityEventService.getEventSpeaker(data, data.event_id);
  }

  @MessagePattern('update_community_event_speaker')
  public async updateCommunityEventSpeaker(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.communityEventService.updateEventSpeaker(data);
  }

  @MessagePattern('delete_community_event_speaker')
  public async deleteCommunityEventSpeaker(@Payload() id: any): Promise<any> {
    return this.communityEventService.deleteEventSpeaker(id);
  }

  @MessagePattern('add_community_timing')
  public async createCommunityEventTiming(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.communityEventService.createEventTiming(data);
  }

  @MessagePattern('get_community_event_timing_by_id')
  public async getTimingDataById(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityEventService.getEventTiming(data, data.event_id);
  }

  @MessagePattern('update_event_timing')
  public async updateCommunityEventTiming(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.communityEventService.updateEventTiming(data, null);
  }

  @MessagePattern('delete_community_event_timing')
  public async deleteCommunityEventTiming(@Payload() id: any): Promise<any> {
    return this.communityEventService.deleteEventTiming(id);
  }

  @MessagePattern('add_community_event_lecture')
  public async createCommunityEventLecture(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.communityEventService.createEventLecture(data);
  }

  @MessagePattern('get_community_event_lecture_by_id')
  public async getLectureDataById(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityEventService.getEventLecture(data, data.event_id);
  }

  @MessagePattern('update_community_event_lecture')
  public async updateCommunityEventLecture(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.communityEventService.updateEventLecture(data);
  }

  @MessagePattern('delete_community_event_lecture')
  public async deleteCommunityEventLecture(@Payload() id: any): Promise<any> {
    return this.communityEventService.deleteEventLecture(id);
  }

  @MessagePattern('update_community_event')
  public async updateCommunityEventData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return await this.communityEventService.updateEvent(
      data.id,
      data.cover_img,
      data,
      0,
    );
  }

  @MessagePattern('get_all_community_events')
  public async allCommunityEventData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.communityEventService.getEvents(data, 0);
  }

  @MessagePattern('get_community_event_by_id')
  public async getCommunityEventDataById(@Payload() id: any): Promise<any> {
    return this.communityEventService.getEventById(id, 0);
  }

  @MessagePattern('get_event_by_community')
  public async getCommunityEventByCommunity(@Payload() id: any): Promise<any> {
    return this.communityEventService.getEventsByCommunity(id, 0);
  }

  @MessagePattern('delete_community_event')
  public async deleteEventData(@Payload() id: any): Promise<any> {
    return this.communityEventService.deleteEventByAdmin(id);
  }

  @MessagePattern('get_event_by_status')
  public async get_event_by_status(@Payload() status: any): Promise<any> {
    return this.communityEventService.getAdminEventsByStatus(status);
  }

  @MessagePattern('change_event_status')
  public async change_event_status(@Payload() data: any): Promise<any> {
    return this.communityEventService.changeEventStatusAdmin(data, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover_image'))
  async createCommunityEvent(
    @UploadedFile() cover_image: Express.Multer.File,
    @Body(ValidationPipe) data: CommunityEventDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityEventService.createEvent(
      data,
      cover_image,
      user_id,
    );
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

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/event-speaker/:id')
  async getEventSpeakers(
    @Param() event_id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return this.communityEventService.getEventSpeaker(newD, event_id.id);
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
    return this.communityEventService.updateEventSpeaker(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/event-speaker/:id')
  async deleteEventSpeaker(@Param() id: GetByIdDto): Promise<any> {
    return this.communityEventService.deleteEventSpeaker(id.id);
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

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/event-timing/:id')
  async getEventTiming(
    @Param() event_id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return this.communityEventService.getEventTiming(newD, event_id.id);
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
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.updateEventTiming(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/event-timing/:id')
  async deleteEventTiming(@Param() id: GetByIdDto): Promise<any> {
    return this.communityEventService.deleteEventTiming(id.id);
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

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/event-lecture/:id')
  async getEventLecture(
    @Param() event_id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return this.communityEventService.getEventLecture(newD, event_id.id);
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
    return this.communityEventService.updateEventLecture(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/event-lecture/:id')
  async deleteEventLecture(@Param() id: GetByIdDto): Promise<any> {
    return this.communityEventService.deleteEventLecture(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover_image'))
  @Put('/:id')
  async updateCommunityEvent(
    @Param() id: GetByIdDto,
    @UploadedFile() cover_image: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateCommunityEventDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.updateEvent(
      id.id,
      cover_image,
      data,
      user_id,
    );
  }

  @AllowUnauthorizedRequest()
  @UseGuards(ClientAuthGuard)
  @Get('/open')
  async getCommunityOpenEvents(@Query() data: PaginationDto): Promise<any> {
    return this.communityEventService.getOpenEvents(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  async getCommunityEvents(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return this.communityEventService.getEvents(newD, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/search')
  async searchCommunityEvent(
    @Query() queryParam: SearchDataQueryEventDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.searchEvent(queryParam, user_id);
  }

  @AllowUnauthorizedRequest()
  @UseGuards(ClientAuthGuard)
  @Get('/open/by-id')
  async getOpenCommunityEventById(@Query() id: GetByIdDto): Promise<any> {
    return this.communityEventService.getEventById(id.id, 0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  async getCommunityEventById(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.getEventById(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/dashboard/recommended/:id')
  async getRecommendedEvents(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.getRecommendedEvents(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/community/:id')
  async getEventByCommunity(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.getEventsByCommunity(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id')
  async deleteCommunityEvent(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.deleteEvent(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/attend-event/:id')
  async attendEvent(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.attendEvent(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/allow')
  async communityAllow(@Body() data: AllowEventDto): Promise<any> {
    return await this.communityEventService.eventAllow(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/attend-event/:id')
  async deleteAttendEvent(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.communityEventService.deleteAttendEvent(id.id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/attendee/status/:id/:status')
  async attendeeStatus(
    @Param() status: EventAttendeeStatusDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityEventService.attendeeStatus(status, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/event-type/:event_type')
  async getEventsByType(
    @Param() event_type: EventTypeDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityEventService.eventByType(event_type, user_id);
  }

  @AllowUnauthorizedRequest()
  @Get('/open/event-type/')
  async getEventsByTypeOpen(@Query() event_type: EventTypeDto): Promise<any> {
    return await this.communityEventService.eventByTypeOpen(event_type);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/trending/event')
  async getTrendingEvent(@Query() data: PaginationDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return this.communityEventService.getTrendingEvent(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/invite')
  async inviteUsersToEvent(
    @Body(ValidationPipe) data: InviteUsersToEventDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.communityEventService.inviteUsers(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/event-attendees/:event_id/:search')
  async searchCommunityEventAttendees(
    @Param('event_id') event_id: number,
    @Query() data: SearchDatasDto,
  ): Promise<any> {
    return await this.communityEventService.searchCommunityEventAttendees(
      event_id,
      data,
    );
  }
}
