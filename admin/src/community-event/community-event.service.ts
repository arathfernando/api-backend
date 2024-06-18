import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateCommunityEventDto,
  GetByIdDto,
  UpdateCommunityEventDto,
  UpdateEventStatusDto,
} from 'src/helper/dtos';
import { GetEventByStatus } from 'src/helper/dtos/get-event-status.dto';
import { S3Service } from 'src/helper/services/s3/s3.service';

@Injectable()
export class CommunityEventService {
  constructor(
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) {
    this.communityClient.connect();
  }

  async createCommunityEvent(
    image: any,
    data: CreateCommunityEventDto,
  ): Promise<any> {
    try {
      let cover_img;

      if (image) {
        cover_img = await this.s3Service.uploadFile(image);
      }

      const communityDto: any = data;
      communityDto.cover_img = cover_img.Location;

      const createdRes = await firstValueFrom(
        this.communityClient.send('add_community_event', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCommunityEvent(
    data: UpdateCommunityEventDto,
    id: number,
    image: any,
  ): Promise<any> {
    try {
      let cover_img;

      if (image) {
        cover_img = await this.s3Service.uploadFile(image);
      }

      const new_data: any = data;
      new_data.id = id;
      if (cover_img) {
        new_data.cover_image = cover_img.Location;
      }
      return await firstValueFrom(
        this.communityClient.send(
          'update_community_event',
          JSON.stringify(new_data),
        ),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  async createEventSpeaker(data: any): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.communityClient.send(
          'add_community_speaker',
          JSON.stringify(data),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getEventSpeaker(data: any): Promise<any> {
    try {
      const communityEventSpeaker = await firstValueFrom(
        this.communityClient.send(
          'get_community_event_speaker_by_id',
          JSON.stringify(data),
        ),
      );

      return communityEventSpeaker;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateEventSpeaker(data: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.communityClient.send(
          'update_community_event_speaker',
          JSON.stringify(data),
        ),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteEventSpeaker(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.communityClient.send('delete_community_event_speaker', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createEventTiming(data: any): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.communityClient.send('add_community_timing', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateTiming(data: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.communityClient.send('update_event_timing', JSON.stringify(data)),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getEventTiming(data: any): Promise<any> {
    try {
      const communityEventTiming = await firstValueFrom(
        this.communityClient.send(
          'get_community_event_timing_by_id',
          JSON.stringify(data),
        ),
      );

      return communityEventTiming;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteTiming(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.communityClient.send('delete_community_event_timing', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createEventLecture(data: any): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.communityClient.send(
          'add_community_event_lecture',
          JSON.stringify(data),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getEventLecture(data: any): Promise<any> {
    try {
      const communityEventLecture = await firstValueFrom(
        this.communityClient.send(
          'get_community_event_lecture_by_id',
          JSON.stringify(data),
        ),
      );

      return communityEventLecture;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateLecture(data: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.communityClient.send(
          'update_community_event_lecture',
          JSON.stringify(data),
        ),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteLecture(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.communityClient.send('delete_community_event_lecture', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllCommunityEvents(
    limit: number,
    page_no: number,
  ): Promise<any> {
    try {
      const skip = limit * page_no - limit;

      const communityEvents = await firstValueFrom(
        this.communityClient.send(
          'get_all_community_events',
          JSON.stringify({
            take: limit,
            skip,
          }),
        ),
      );

      return communityEvents;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunityEvent(id: number): Promise<any> {
    try {
      const communityEvent = await firstValueFrom(
        this.communityClient.send('get_community_event_by_id', id),
      );

      return communityEvent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunityEventByCommunity(id: number): Promise<any> {
    try {
      const communityEvents = await firstValueFrom(
        this.communityClient.send('get_event_by_community', id),
      );

      return communityEvents;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCommunityEvent(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.communityClient.send('delete_community_event', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunityEventByStatus(
    status: GetEventByStatus,
  ): Promise<any> {
    try {
      const communityEvents = await firstValueFrom(
        this.communityClient.send('get_event_by_status', status.status),
      );

      return communityEvents;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCommunityEventStatus(
    id: GetByIdDto,
    status: UpdateEventStatusDto,
  ): Promise<any> {
    try {
      const communityEvents = await firstValueFrom(
        this.communityClient.send('change_event_status', {
          id: id.id,
          status: status.status,
        }),
      );

      return communityEvents;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
