import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ATTENDEE_STATUS,
  COMMUNITY_INVITE_STATUS,
  COMMUNITY_REQUEST_STATUS,
  COMMUNITY_REQUEST_TYPE,
  EVENT_STATUS,
  EVENT_TYPE,
} from 'src/core/constant/enum.constant';
import { AllowEventDto } from 'src/core/dtos/community-event/allow-in-event.dto';
import { EventAttendeeStatusDto } from 'src/core/dtos/community-event/attendee-status.dto';
import { EventTypeDto } from 'src/core/dtos/community-event/event-type.dto';
import { InviteUsersToEventDto } from 'src/core/dtos/community-event/invite-user-event.dto';
import { SearchDataQueryEventDto } from 'src/core/dtos/community-event/search-data-query.dto';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  Community,
  CommunityEvent,
  CommunityUser,
  EventSpeaker,
  EventTiming,
  EventAttendees,
} from 'src/database/entities';
import { EventLectureTiming } from 'src/database/entities/event-lecture.entity';
import { IMailPayload } from '../core/interfaces';
import { In, Repository } from 'typeorm';
import { CommunityRequest } from 'src/database/entities/community-request.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommunityEventService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('TOKEN_SERVICE') private readonly tokenClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(CommunityEvent)
    private readonly communityEventRepository: Repository<CommunityEvent>,
    @InjectRepository(EventSpeaker)
    private readonly eventSpeakerRepository: Repository<EventSpeaker>,
    @InjectRepository(EventTiming)
    private readonly eventTimingRepository: Repository<EventTiming>,
    @InjectRepository(EventLectureTiming)
    private readonly eventLectureTimingRepository: Repository<EventLectureTiming>,
    @InjectRepository(CommunityRequest)
    private readonly communityRequestRepository: Repository<CommunityRequest>,
    @InjectRepository(EventAttendees)
    private readonly attendEventRepository: Repository<EventAttendees>,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    this.userClient.connect();
    this.mailClient.connect();
    this.tokenClient.connect();
  }

  public async createEvent(
    data: any,
    file: any,
    user_id: number,
  ): Promise<any> {
    try {
      const community = await this.communityRepository.findOne({
        where: {
          id: data.community_id,
        },
      });

      if (!community) {
        throw new HttpException(
          'COMMUNITY_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let cover_img;

      if (file && typeof file != 'string') {
        cover_img = await this.s3Service.uploadFile(file);
      }

      const createEvent = new CommunityEvent();
      createEvent.cover_image =
        file && typeof file !== 'string' ? cover_img.Location : data.cover_img;
      createEvent.event_title = data.event_title;
      createEvent.intro = data.intro ? data.intro : null;
      createEvent.description = data.description;
      createEvent.event_type = data.event_type ? data.event_type : null;
      createEvent.event_webpage = data.event_webpage
        ? data.event_webpage
        : null;
      createEvent.online_event = data.online_event;
      createEvent.meeting_link = data.meeting_link ? data.meeting_link : null;
      createEvent.address = data.address ? data.address : null;
      createEvent.city = data.city ? data.city : null;
      createEvent.map_link = data.map_link ? data.map_link : null;
      createEvent.unlimited_seats = data.unlimited_seats;
      createEvent.no_of_seats = data.no_of_seats ? data.no_of_seats : null;
      createEvent.single_day_event = data.single_day_event;
      createEvent.created_by = user_id;
      createEvent.goals = data.goals ? data.goals.split(',') : [];
      createEvent.status =
        data.event_type && data.event_type == EVENT_TYPE.GLOBAL
          ? EVENT_STATUS.PENDING
          : EVENT_STATUS.ACCEPTED;
      createEvent.tags = data.tags ? data.tags : null;

      const eventCreated: any =
        await this.communityEventRepository.save(createEvent);
      if (community) {
        const communityRequest = new CommunityRequest();
        communityRequest.community = community;
        communityRequest.created_by = user_id;
        communityRequest.community_request_status =
          COMMUNITY_REQUEST_STATUS.PENDING;
        communityRequest.community_request_type = COMMUNITY_REQUEST_TYPE.EVENT;
        communityRequest.request_reference_id = createEvent.id;
        await this.communityRequestRepository.save(communityRequest);
      }

      const resTags: any = [];
      if (eventCreated.tags) {
        const tags = eventCreated.tags.split(',');
        const interest = await firstValueFrom(
          this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
        );
        resTags.push(interest);
      }
      eventCreated.tags = resTags;

      return eventCreated;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async createEventSpeaker(data: any): Promise<any> {
    try {
      const response = [];
      for (let i = 0; i < data.length; i++) {
        const event = await this.communityEventRepository.findOne({
          where: {
            id: data[i].event_id,
          },
        });
        if (!event) {
          return {
            status: 500,
            message: 'No event found.',
          };
        }
        const eventSpeaker = new EventSpeaker();
        eventSpeaker.name = data[i].name;
        eventSpeaker.bio = data[i].bio;
        eventSpeaker.role = data[i].role;
        eventSpeaker.cover = data[i].cover;
        eventSpeaker.event = event;
        await this.eventSpeakerRepository.save(eventSpeaker);
        response.push(eventSpeaker);
      }
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createEventTiming(data: any): Promise<any> {
    try {
      const response = [];
      for (let i = 0; i < data.length; i++) {
        const event = await this.communityEventRepository.findOne({
          where: {
            id: data[i].event_id,
          },
        });
        if (!event) {
          return {
            status: 500,
            message: 'No event found.',
          };
        }
        const eventTiming = new EventTiming();
        eventTiming.event = event;
        eventTiming.start_date = data[i].start_date;
        eventTiming.start_time = data[i].start_time;
        eventTiming.end_time = data[i].end_time;
        await this.eventTimingRepository.save(eventTiming);
        response.push(eventTiming);
      }
      return response;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async createEventLecture(data: any): Promise<any> {
    try {
      const response = [];
      for (let i = 0; i < data.length; i++) {
        const event = await this.communityEventRepository.findOne({
          where: {
            id: data[i].event_id,
          },
        });

        if (!event) {
          return {
            status: 500,
            message: 'No event found.',
          };
        }

        const speaker = await this.eventSpeakerRepository.findOne({
          where: {
            id: data[i].speaker_id,
            event: {
              id: data[i].event_id,
            },
          },
        });

        if (!speaker) {
          return {
            status: 500,
            message: 'No event-speaker found.',
          };
        }

        const eventTiming = await this.eventTimingRepository.findOne({
          where: {
            id: data[i].event_timing_id,
            event: {
              id: data[i].event_id,
            },
          },
        });

        if (!eventTiming) {
          return {
            status: 500,
            message: 'No event-timing found.',
          };
        }
        const eventLectureTiming = new EventLectureTiming();
        eventLectureTiming.event = event;
        eventLectureTiming.event_speakers = speaker;
        eventLectureTiming.event_timing = eventTiming;
        eventLectureTiming.start_time = data[i].start_time;
        eventLectureTiming.end_time = data[i].end_time;
        eventLectureTiming.title = data[i].title;
        eventLectureTiming.description = data[i].description;
        eventLectureTiming.location = data[i].location;
        eventLectureTiming.cover = data[i].cover;
        await this.eventLectureTimingRepository.save(eventLectureTiming);
        response.push(eventLectureTiming);
      }

      return response;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateEvent(
    id: number,
    file: any,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where = {
        id,
        created_by: user_id,
      };
      const event = await this.communityEventRepository.findOne({
        where: user_id === 0 ? { id } : where,
        relations: ['event_timing', 'event_speakers'],
      });

      if (!event) {
        throw new HttpException(
          'EVENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const community = await this.communityRepository.findOne({
        where: {
          id: data.community_id,
        },
      });
      if (!community) {
        throw new HttpException(
          'COMMUNITY_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let cover_img;
      if (file && typeof file != 'string') {
        cover_img = await this.s3Service.uploadFile(file);
        data.cover_image = cover_img.Location;
      } else {
        data.cover_image = event.cover_image;
      }

      if (data.goals) {
        data.goals = data.goals.split(',');
      }
      if (data.community_id || data.reason_of_the_rejection || data.feedback) {
        const topicRequest = await this.communityRequestRepository.findOne({
          where: {
            request_reference_id: id,
            community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
          },
        });

        if (data.community_id) {
          delete data.community_id;
          topicRequest.community = community;
        }
        if (data.reason_of_the_rejection) {
          topicRequest.reason_of_the_rejection = data.reason_of_the_rejection;
        }
        if (data.feedback) {
          topicRequest.feedback = data.feedback;
        }

        await this.communityRequestRepository.save(topicRequest);
        delete data.reason_of_the_rejection;
        delete data.feedback;
      }

      await this.communityEventRepository.update(event.id, data);

      return await this.getEventById(id, 0);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateEventSpeaker(data: any): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const speaker = await this.eventSpeakerRepository.findOne({
          where: {
            id: data[i].id,
          },
        });
        if (!speaker) {
          return {
            status: 500,
            message: 'Event speaker not found',
          };
        }
        if (data[i].event_id) {
          const event = await this.communityEventRepository.findOne({
            where: {
              id: data[i].event_id,
            },
          });
          if (!event) {
            throw new HttpException(
              'EVENT_NOT_FOUND',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          delete data[i].event_id;
          data[i].event = event;
        }
        await this.eventSpeakerRepository.update(data[i].id, data[i]);
      }
      return {
        status: 200,
        message: 'Event speaker updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateEventLecture(data: any): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const lectureTiming = await this.eventLectureTimingRepository.findOne({
          where: {
            id: data[i].id,
          },
        });
        if (!lectureTiming) {
          return {
            status: 500,
            message: 'Event Lecture not found',
          };
        }

        const event = await this.communityEventRepository.findOne({
          where: {
            id: data[i].event_id,
          },
        });

        if (!event) {
          return {
            status: 500,
            message: 'No event found.',
          };
        }
        if (data[i].speaker_id) {
          const speaker = await this.eventSpeakerRepository.findOne({
            where: {
              id: data[i].speaker_id,
              event: {
                id: data[i].event_id,
              },
            },
          });

          if (!speaker) {
            return {
              status: 500,
              message: 'No event-speaker found.',
            };
          }

          delete data[i].speaker_id;
          data[i].event_speakers = speaker;
        }
        delete data[i].event_id;

        if (data[i].event_timing_id) {
          const eventTiming = await this.eventTimingRepository.findOne({
            where: {
              id: data[i].event_timing_id,
              event: {
                id: event.id,
              },
            },
          });

          if (!eventTiming) {
            return {
              status: 500,
              message: 'No event-timing found.',
            };
          }
          delete data[i].event_timing_id;
          data[i].event_timing = eventTiming;
        }
        await this.eventLectureTimingRepository.update(data[i].id, data[i]);
      }

      return {
        status: 200,
        message: 'Event lecture updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateEventTiming(data: any, user_id: number): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const eventTiming = await this.eventTimingRepository.findOne({
          where: {
            id: data[i].id,
          },
        });
        if (!eventTiming) {
          return {
            status: 500,
            message: 'Event Timing not found',
          };
        }

        if (data[i].event_id) {
          const event = await this.communityEventRepository.findOne({
            where: {
              id: data[i].event_id,
            },
          });
          if (!event) {
            throw new HttpException(
              'EVENT_NOT_FOUND',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          delete data[i].event_id;
          data[i].event = event;
        }
        await this.eventTimingRepository.update(data[i].id, data[i]);
        const invitedUser = await this.getUser(Number(user_id));
        const eventHost = await this.getUser(Number(data[i].event.created_by));

        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'EVENT_TIME_UPDATE',
          ),
        );

        const joinRequestNotification = {
          title: admin_notification.notification_title.replace(
            '*user*',
            invitedUser && invitedUser.general_profile
              ? invitedUser.general_profile.first_name
              : '',
          ),
          content: admin_notification.notification_content.replace(
            '*user*',
            invitedUser && invitedUser.general_profile
              ? invitedUser.general_profile.first_name
              : '',
          ),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: data[i].event.created_by,
          payload: data[i],
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );

        const payload: IMailPayload = {
          template: 'EVENT_TIME_UPDATE',
          payload: {
            emails: [eventHost.email],
            data: {
              host_name:
                eventHost && eventHost.general_profile
                  ? eventHost.general_profile.first_name
                  : '',
              event_name: data[i].event ? data[i].event.event_title : '',
              user_name: `${
                invitedUser && invitedUser.general_profile
                  ? invitedUser.general_profile.first_name
                  : ''
              } ${
                invitedUser && invitedUser.general_profile
                  ? invitedUser.general_profile.last_name
                  : ''
              }`,
              link: `${this.configService.get<string>('event_url')}/${data[i]
                .event?.id}`,
            },
            subject: `An event has changed time`,
          },
        };

        this.mailClient.emit('send_email', payload);
      }

      return {
        status: 200,
        message: 'Event timing updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getEvents(data: any, user_id: number): Promise<any> {
    try {
      let events: any;
      if (user_id == 0) {
        events = await this.communityEventRepository.find({
          relations: [
            'event_timing',
            'event_speakers',
            'event_lecture_timing',
            'event_lecture_timing.event_speakers',
            'event_lecture_timing.event_timing',
          ],
          order: {
            id: 'DESC',
          },
          take: data.take,
          skip: data.skip,
        });
      } else {
        events = await this.communityEventRepository.find({
          relations: [
            'event_timing',
            'event_speakers',
            'event_lecture_timing',
            'event_lecture_timing.event_speakers',
            'event_lecture_timing.event_timing',
          ],
          order: {
            id: 'DESC',
          },
          take: data.take,
          skip: data.skip,
          where: {
            status: EVENT_STATUS.ACCEPTED,
          },
        });
      }

      const eventsRes: any = [...events];

      if (eventsRes.length > 0) {
        for (let i = 0; i < eventsRes.length; i++) {
          const communityRequest: any =
            await this.communityRequestRepository.find({
              where: {
                request_reference_id: eventsRes[i].id,
                community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
              },
              order: {
                id: 'DESC',
              },
              relations: ['community'],
            });
          eventsRes[i].community_request = communityRequest
            ? communityRequest
            : {};
          if (eventsRes[i].created_by) {
            const user = await firstValueFrom(
              this.userClient.send<any>('get_user_by_id', {
                userId: Number(eventsRes[i].created_by),
              }),
            );

            delete user.password;
            delete user.verification_code;
            delete user.reset_password_otp;

            eventsRes[i].created_by = user;
          }
          const resTags: any = [];
          if (eventsRes[i].tags) {
            const tags = eventsRes[i].tags.split(',');
            const interest = await firstValueFrom(
              this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
            );
            resTags.push(interest);
          }
          eventsRes[i].tags = resTags;
        }
        return eventsRes;
      } else {
        return {
          message: 'Events not found',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getOpenEvents(data: any): Promise<any> {
    try {
      const total = await this.communityEventRepository.count();
      const totalPages = Math.ceil(total / data.limit);
      const events: any = await this.communityEventRepository.find({
        relations: [
          'event_timing',
          'event_speakers',
          'event_lecture_timing',
          'event_lecture_timing.event_speakers',
          'event_lecture_timing.event_timing',
        ],
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
        where: {
          status: EVENT_STATUS.ACCEPTED,
        },
      });
      const eventsRes: any = [...events];

      if (eventsRes.length > 0) {
        for (let i = 0; i < eventsRes.length; i++) {
          const communityRequest: any =
            await this.communityRequestRepository.find({
              where: {
                request_reference_id: eventsRes[i].id,
                community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
              },
              order: {
                id: 'DESC',
              },
              relations: ['community'],
            });
          eventsRes[i].community_request = communityRequest
            ? communityRequest
            : {};
          if (eventsRes[i].created_by) {
            const user = await firstValueFrom(
              this.userClient.send<any>('get_user_by_id', {
                userId: Number(eventsRes[i].created_by),
              }),
            );

            delete user.password;
            delete user.verification_code;
            delete user.reset_password_otp;

            eventsRes[i].created_by = user;
          }
          const resTags: any = [];
          if (eventsRes[i].tags) {
            const tags = eventsRes[i].tags.split(',');
            const interest = await firstValueFrom(
              this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
            );
            resTags.push(interest);
          }
          eventsRes[i].tags = resTags;
        }
        return {
          data: eventsRes,
          page: data.page,
          limit: data.limit,
          total_pages: totalPages,
          count: total,
        };
      } else {
        return {
          message: 'Events not found',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getEventSpeaker(data: any, event_id: number): Promise<any> {
    try {
      const speakers = await this.eventSpeakerRepository.find({
        where: {
          event: {
            id: event_id,
          },
        },
        take: data.take,
        skip: data.skip,
      });
      return speakers;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getEventTiming(data: any, event_id: number): Promise<any> {
    try {
      const speakers = this.eventTimingRepository.find({
        where: {
          event: {
            id: event_id,
          },
        },
        take: data.take,
        skip: data.skip,
      });
      return speakers;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getEventLecture(data: any, event_id: number): Promise<any> {
    try {
      const speakers = this.eventLectureTimingRepository.find({
        where: {
          event: {
            id: event_id,
          },
        },
        take: data.take,
        skip: data.skip,
      });
      return speakers;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getEventsByCommunity(
    community_id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const requestIds = await this.communityRequestRepository.find({
        where: {
          community: {
            id: community_id,
          },
          community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
        },
        relations: ['community'],
      });

      const eventRes: any = [];

      if (requestIds.length > 0) {
        for (let i = 0; i < requestIds.length; i++) {
          const event: any = await this.communityEventRepository.findOne({
            where: {
              id: requestIds[i].request_reference_id,
            },
          });

          if (event && event.created_by) {
            const user = await firstValueFrom(
              this.userClient.send<any>('get_user_by_id', {
                userId: Number(event.created_by),
              }),
            );
            delete user.password;
            delete user.verification_code;
            delete user.reset_password_otp;
            const count = await this.attendEventRepository.count({
              where: {
                event: {
                  id: event.id,
                },
              },
            });
            const attendee = await this.attendEventRepository.findOne({
              where: {
                event: {
                  id: event.id,
                },
                attendee: user_id,
              },
            });
            if (attendee) {
              event.is_attending = true;
            } else {
              event.is_attending = false;
            }
            event.member_counts = count;
            event.is_host = event.created_by == user_id ? true : false;
            event.created_by = user;
            event.is_requested =
              event.currUser && event.currUser.invite_status === 'PENDING'
                ? true
                : false;
            event.is_rejected =
              event.currUser && event.currUser.invite_status === 'REJECTED'
                ? true
                : false;
            const resTags: any = [];
            if (event && event.tags) {
              const tags = event.tags.split(',');
              const interest = await firstValueFrom(
                this.adminClient.send(
                  'get_basic_type_ids',
                  JSON.stringify(tags),
                ),
              );
              resTags.push(interest);
            }
            event.tags = resTags;
            eventRes.push(event);
          }
        }
        return eventRes;
      } else {
        return {
          status: 500,
          message: 'Events not found',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getEventById(id: number, user_id: number): Promise<any> {
    try {
      let event: any;
      if (user_id == 0) {
        event = await this.communityEventRepository.findOne({
          where: {
            id: id,
          },
          relations: [
            'event_timing',
            'event_speakers',
            'event_lecture_timing',
            'event_lecture_timing.event_speakers',
            'event_lecture_timing.event_timing',
          ],
        });
      } else {
        event = await this.communityEventRepository.findOne({
          where: {
            id: id,
            status: EVENT_STATUS.ACCEPTED,
          },
          relations: [
            'event_timing',
            'event_speakers',
            'event_lecture_timing',
            'event_lecture_timing.event_speakers',
            'event_lecture_timing.event_timing',
          ],
        });
      }

      if (!event) {
        throw new HttpException(
          'EVENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const eventRes: any = event;

      const communityRequest: any =
        await this.communityRequestRepository.findOne({
          where: {
            request_reference_id: eventRes.id,
            community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
          },
          order: {
            id: 'DESC',
          },
          relations: ['community'],
        });
      eventRes.community_request = communityRequest ? communityRequest : {};
      if (eventRes.created_by) {
        const user = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(eventRes.created_by),
          }),
        );

        delete user.password;
        delete user.verification_code;
        delete user.reset_password_otp;

        eventRes.created_by = user;
      }

      const resTags: any = [];
      if (eventRes.tags) {
        const tags = eventRes.tags.split(',');
        const interest = await firstValueFrom(
          this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
        );
        resTags.push(interest);
      }

      eventRes.tags = resTags;

      if (eventRes.goals) {
        const goals = [];
        for (let i = 0; i < eventRes.goals.length; i++) {
          const goal = await firstValueFrom(
            this.adminClient.send('get_goal_by_id', eventRes.goals[i]),
          );
          goals.push(goal);
        }
        eventRes.goals = goals;
      }

      if (user_id > 0) {
        const count = await this.attendEventRepository.count({
          where: {
            event: { id: eventRes.id },
          },
        });
        const attendee = await this.attendEventRepository.findOne({
          where: {
            event: { id: eventRes.id },
            attendee: user_id,
          },
        });

        if (attendee) {
          eventRes.is_attending = true;
        } else {
          eventRes.is_attending = false;
        }
        eventRes.attending_member_counts = count;
        if (eventRes.community_request.community) {
          const community_user = await this.communityUserRepository.findOne({
            where: {
              community: {
                id: eventRes.community_request.community.id,
              },
              user_id: user_id,
            },
          });

          if (
            community_user?.invite_status === COMMUNITY_INVITE_STATUS.REJECTED
          ) {
            eventRes.community_request.community.is_rejected = true;
          } else {
            eventRes.community_request.community.is_rejected = false;
          }

          if (
            community_user?.invite_status === COMMUNITY_INVITE_STATUS.PENDING
          ) {
            eventRes.community_request.community.is_requested = true;
          } else {
            eventRes.community_request.community.is_requested = false;
          }
        }
      }

      return eventRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getRecommendedEvents(
    community_id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const userInterests = await firstValueFrom(
        this.userClient.send<any>('get_user_interests', {
          userId: Number(user_id),
        }),
      );
      const requestEvent = await this.communityRequestRepository.find({
        where: {
          community: {
            id: community_id,
          },
          // request_reference_id: eventRes[i].id,
          community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
          community_request_status: COMMUNITY_REQUEST_STATUS.ACCEPTED,
        },
        order: {
          id: 'DESC',
        },
        // relations: ['community'],
      });
      const eventIds = await this.arrayColumn(
        requestEvent,
        'request_reference_id',
      );
      const events = await this.communityEventRepository.find({
        where: {
          id: In(eventIds),
        },
      });
      let recommendedFlag = 0;

      const returnEvents = [];
      for (let i = 0; i < events.length; i++) {
        if (events[i].tags && userInterests && userInterests.length > 0) {
          const eventTag = events[i].tags;

          for (let j = 0; j < userInterests.length; j++) {
            if (eventTag.includes(String(userInterests[j].id))) {
              returnEvents.push(events[i]);
              recommendedFlag++;
              break;
            }
          }
          if (recommendedFlag === 3) {
            break;
          }
        } else {
          returnEvents.push(events[i]);
          recommendedFlag++;

          if (recommendedFlag === 3) {
            break;
          }
        }
      }

      for (let j = 0; j < returnEvents.length; j++) {
        const resTags: any = [];

        if (returnEvents[j].tags) {
          const tags = returnEvents[j].tags.split(',');
          const interest = await firstValueFrom(
            this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
          );
          resTags.push(interest);
        }
        returnEvents[j].tags = resTags;
      }

      return returnEvents;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteEvent(id: number, user_id: number): Promise<any> {
    try {
      const event = await this.communityEventRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });

      if (!event) {
        throw new HttpException(
          'EVENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.communityEventRepository.delete(id);

      return {
        status: 200,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteEventSpeaker(id: number): Promise<any> {
    try {
      const speaker = await this.eventSpeakerRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!speaker) {
        return {
          status: 500,
          message: 'Event speaker not found.',
        };
      }

      await this.eventSpeakerRepository.delete(id);

      return {
        status: 200,
        message: 'Event speaker deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteEventTiming(id: number): Promise<any> {
    try {
      const speaker = await this.eventTimingRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!speaker) {
        return {
          status: 500,
          message: 'Event timing not found.',
        };
      }

      await this.eventTimingRepository.delete(id);

      return {
        status: 200,
        message: 'Event timing deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteEventLecture(id: number): Promise<any> {
    try {
      const lecture = await this.eventLectureTimingRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!lecture) {
        return {
          status: 500,
          message: 'Lecture not found.',
        };
      }

      await this.eventLectureTimingRepository.delete(id);

      return {
        status: 200,
        message: 'Event Lecture deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteEventByAdmin(id: number): Promise<any> {
    try {
      const event = await this.communityEventRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!event) {
        throw new HttpException(
          'EVENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.communityEventRepository.delete(id);

      return {
        status: 200,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private findObject(arr, value, return_type) {
    const element = arr.find((val) => {
      return Number(val.user_id) === Number(value);
    });

    if (return_type === 'bool') {
      return typeof element === 'undefined' ? false : true;
    } else {
      return element;
    }
  }

  async searchEvent(
    data: SearchDataQueryEventDto,
    user_id: number,
  ): Promise<any> {
    try {
      const event: any = await this.communityEventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.event_timing', 'event_timing')
        .leftJoinAndSelect('event.event_speakers', 'event_speakers')
        .where('event.status = :status', {
          status: EVENT_STATUS.ACCEPTED,
        });

      if (data.search) {
        event.andWhere(
          'LOWER(event.event_title) LIKE LOWER(:data) AND event.status = :status',
          {
            data: `%${data.search}%`,
            status: EVENT_STATUS.ACCEPTED,
          },
        );
      }
      if (data.event_type) {
        event.andWhere('event.event_type = :event_type', {
          event_type: `${data.event_type}`,
        });
      }
      if (data.community_id) {
        const requestEvent = await this.communityRequestRepository.find({
          where: {
            community: {
              id: data.community_id,
            },
            community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
          },
          order: {
            id: 'DESC',
          },
          relations: ['community'],
        });

        const eventIds = await this.arrayColumn(
          requestEvent,
          'request_reference_id',
        );
        event.andWhere('event.id IN(:...community_id)', {
          community_id: eventIds.map(Number),
        });
      } else {
        const community = await this.communityUserRepository.query(
          `SELECT community_id FROM community_user WHERE user_id = ${user_id} AND invite_status = '${COMMUNITY_INVITE_STATUS.ACCEPTED}'`,
        );

        const community_ids = await this.arrayColumn(community, 'community_id');
        const requestEvent = await this.communityRequestRepository.find({
          where: {
            community: {
              id: In(community_ids),
            },
            community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
          },
          order: {
            id: 'DESC',
          },
          relations: ['community'],
        });

        if (requestEvent && requestEvent.length > 0) {
          const eventIds = await this.arrayColumn(
            requestEvent,
            'request_reference_id',
          );
          event.andWhere('event.id IN(:...community_id)', {
            community_id: eventIds.map(Number),
          });
        }
      }
      const events = await event.getMany();
      if (user_id > 0 && !data.search) {
        const event_attend = [];
        const recommended_event = [];
        const next_event = [];
        for (let i = 0; i < events.length; i++) {
          const requestEvent = await this.communityRequestRepository.find({
            where: {
              request_reference_id: events[i].id,
              community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
            },
            order: {
              id: 'DESC',
            },
            relations: ['community', 'community.community_users'],
          });
          events[i].community_request = requestEvent ? requestEvent : {};

          if (events[i].created_by == user_id) {
            events[i].is_host = true;
          } else {
            events[i].is_host = false;
          }
          for (let j = 0; j < events[i].community_request.length; j++) {
            const communityRequest = events[i].community_request[j];
            for (
              let k = 0;
              k < communityRequest.community.community_users.length;
              k++
            ) {
              events[i].is_requested =
                communityRequest.community.community_users[k] &&
                communityRequest.community.community_users[k].invite_status ===
                  'PENDING'
                  ? true
                  : false;

              events[i].is_rejected =
                communityRequest.community.community_users[k] &&
                communityRequest.community.community_users[k].invite_status ===
                  'REJECTED'
                  ? true
                  : false;

              if (
                communityRequest.community.community_users[k].invite_status ===
                'ACCEPTED'
              ) {
                events[i].is_attending = true;
                event_attend.push(events[i]);
              } else {
                recommended_event.push(events[i]);
                next_event.push(events[i]);
                events[i].is_attending = false;
              }
            }
          }

          const count = await this.attendEventRepository.count({
            where: {
              event: { id: events[i].id },
            },
          });

          events[i].number_off_attendees = count;
          const resTags: any = [];
          if (events[i].tags) {
            const tags = events[i].tags.split(',');
            const interest = await firstValueFrom(
              this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
            );
            resTags.push(interest);
          }
          events[i].tags = resTags;
        }
        return {
          event_attend: event_attend,
          recommended_event: recommended_event,
          next_event: next_event,
        };
      }
      return events;
    } catch (err) {
      console.log('ERR -->', err);
      throw new InternalServerErrorException(err);
    }
  }

  public async attendEvent(id: number, user_id: number): Promise<any> {
    try {
      const event = await this.communityEventRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!event) {
        throw new HttpException(
          'EVENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const checkUser = await this.attendEventRepository.findOne({
        where: {
          attendee: user_id,
          event: {
            id: event.id,
          },
        },
      });

      if (checkUser && checkUser.status == ATTENDEE_STATUS.PENDING) {
        return {
          status: 200,
          message: "You're already applied for joining event",
        };
      }

      if (checkUser && checkUser.status == ATTENDEE_STATUS.APPROVED) {
        return {
          status: 200,
          message: "You're already joined event",
        };
      }
      const attendEvent = new EventAttendees();

      attendEvent.attendee = user_id;
      attendEvent.event = event;

      await this.attendEventRepository.save(attendEvent);
      let eventHost: any;
      if (event.created_by) {
        eventHost = await this.getUser(Number(event.created_by));
      }
      const invitedUser = await this.getUser(user_id);
      const userSetting = await this.getUserSetting(user_id);
      let sentNotification = true;
      if (userSetting.length) {
        for (let i = 0; i < userSetting.length; i++) {
          sentNotification =
            userSetting[i].setting.key == 'community_event_push_notification' &&
            userSetting[i].setting.status == 'ACTIVE' &&
            userSetting[i].value == 'true'
              ? true
              : false;

          if (sentNotification == true) {
            const admin_notification = await firstValueFrom(
              this.adminClient.send<any>(
                'get_notification_by_type',
                'EVENT_ATTEND',
              ),
            );
            const joinRequestNotification = {
              title: admin_notification.notification_title
                .replace('*user*', invitedUser.general_profile.first_name)
                .replace('*event name*', event.event_title),
              content: admin_notification.notification_content
                .replace('*user*', invitedUser.general_profile.first_name)
                .replace('*event name*', event.event_title),
              type: admin_notification.notification_type,
              notification_from: user_id,
              notification_to: event.created_by,
              payload: attendEvent,
            };

            await firstValueFrom(
              this.notificationClient.send<any>(
                'create_notification',
                JSON.stringify(joinRequestNotification),
              ),
            );
          }
        }
      }

      return {
        status: 200,
        message: "You're request is submitted successfully",
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async eventAllow(data: AllowEventDto): Promise<any> {
    try {
      const eventAttendee = await this.attendEventRepository.findOne({
        where: {
          event: {
            id: data.event_id,
          },
          attendee: data.user_id,
        },
      });

      if (!eventAttendee) {
        throw new HttpException(
          'EVENT_USER_REQUEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      eventAttendee.status = data.status;

      await this.attendEventRepository.update(eventAttendee.id, eventAttendee);

      return {
        status: 200,
        message: `You have successfully ${
          data.status === 'REJECTED' ? 'rejected' : 'accepted'
        } the user`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteAttendEvent(id: number, user_id: number): Promise<any> {
    try {
      const attendEvent = await this.attendEventRepository.findOne({
        where: {
          event: {
            id: id,
          },
          attendee: user_id,
        },
      });

      if (!attendEvent) {
        return {
          status: 200,
          message: 'No Attend Event Found',
        };
      }

      await this.attendEventRepository.delete(attendEvent.id);

      return {
        status: 200,
        message: 'Remove Attend Event successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async attendeeStatus(
    status: EventAttendeeStatusDto,
    user_id: number,
  ): Promise<any> {
    try {
      const attendee = await this.attendEventRepository.find({
        where: {
          event: {
            id: status.id,
          },
          status: status.status,
        },
        relations: ['event'],
      });
      if (!attendee) {
        throw new HttpException(
          'GROUP_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const attendeeRes: any = [...attendee];

      for (let i = 0; i < attendeeRes.length; i++) {
        if (attendeeRes[i].user_id) {
          attendeeRes[i].user = await this.getUser(attendeeRes[i].user_id);
        }
        const count = await this.attendEventRepository.count({
          where: {
            event: { id: attendeeRes[i].id },
          },
        });

        attendeeRes[i].member_counts = count;
        attendeeRes[i].is_host =
          attendeeRes[i].created_by == user_id ? true : false;
        const resTags: any = [];
        if (attendeeRes[i].event.tags) {
          const tags = attendeeRes[i].event.tags.split(',');
          const interest = await firstValueFrom(
            this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
          );
          resTags.push(interest);
        }

        attendeeRes[i].event.tags = resTags;
      }

      if (attendeeRes.length > 0) {
        return attendeeRes;
      } else {
        return {
          status: 200,
          message: 'No community found',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
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

  public async getUserSetting(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_setting_by_id', user_id),
    );
    return user;
  }

  public async eventByType(type: EventTypeDto, user_id: number): Promise<any> {
    try {
      const event = await this.communityEventRepository.find({
        where: {
          event_type: type.event_type,
          status: EVENT_STATUS.ACCEPTED,
        },
        relations: ['event_timing', 'event_speakers'],
      });

      const eventRes: any = [...event];

      for (let i = 0; i < eventRes.length; i++) {
        const requestEvent = await this.communityRequestRepository.findOne({
          where: {
            request_reference_id: eventRes[i].id,
            community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
          },
          order: {
            id: 'DESC',
          },
          relations: ['community'],
        });

        eventRes[i].community_request = requestEvent ? requestEvent : {};
        if (eventRes[i].created_by) {
          eventRes[i].created_by = await this.getUser(eventRes[i].created_by);
        }
        const count = await this.attendEventRepository.count({
          where: {
            event: { id: eventRes[i].id },
          },
        });

        const attendee = await this.attendEventRepository.findOne({
          where: {
            event: { id: eventRes[i].id },
            attendee: user_id,
          },
        });

        if (attendee) {
          eventRes[i].is_attending = true;
        } else {
          eventRes[i].is_attending = false;
        }
        eventRes[i].attending_member_counts = count;
        eventRes[i].is_host = eventRes[i].created_by == user_id ? true : false;
        eventRes[i].is_requested =
          eventRes[i].currUser &&
          eventRes[i].currUser.invite_status === 'PENDING'
            ? true
            : false;
        eventRes[i].is_rejected =
          eventRes[i].currUser &&
          eventRes[i].currUser.invite_status === 'REJECTED'
            ? true
            : false;
        const resTags: any = [];
        if (eventRes[i].tags) {
          const tags = eventRes[i].tags.split(',');
          const interest = await firstValueFrom(
            this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
          );
          resTags.push(interest);
        }
        eventRes[i].tags = resTags;
      }
      if (eventRes.length > 0) {
        return eventRes;
      } else {
        return {
          status: 200,
          message: 'No event attendees found',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async eventByTypeOpen(type: EventTypeDto): Promise<any> {
    try {
      const event = await this.communityEventRepository.find({
        where: {
          event_type: type.event_type,
          status: EVENT_STATUS.ACCEPTED,
        },
        relations: ['event_timing', 'event_speakers'],
      });

      const eventRes: any = [...event];
      for (let i = 0; i < eventRes.length; i++) {
        if (eventRes[i].created_by) {
          eventRes[i].created_by = await this.getUser(eventRes[i].created_by);
        }
        const count = await this.attendEventRepository.count({
          where: {
            event: eventRes[i],
          },
        });
        eventRes[i].member_counts = count;
        const resTags: any = [];
        if (eventRes[i].tags) {
          const tags = eventRes[i].tags.split(',');
          const interest = await firstValueFrom(
            this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
          );
          resTags.push(interest);
        }
        eventRes[i].tags = resTags;
        const requestEvent = await this.communityRequestRepository.find({
          where: {
            request_reference_id: eventRes[i].id,
            community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
          },
          order: {
            id: 'DESC',
          },
          relations: ['community'],
        });
        eventRes[i].community_request = requestEvent ? requestEvent : {};
      }
      if (eventRes.length > 0) {
        return eventRes;
      } else {
        return {
          status: 200,
          message: 'No event attendees found',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getAdminEventsByStatus(status: EVENT_STATUS): Promise<any> {
    try {
      const where = status != 'ALL' ? { status: status } : '';
      const events = await this.communityEventRepository.find({
        where: { ...where },
        relations: ['event_timing', 'event_speakers'],
      });
      const eventsRes: any = [...events];
      if (eventsRes.length > 0) {
        for (let i = 0; i < eventsRes.length; i++) {
          const requestEvent = await this.communityRequestRepository.find({
            where: {
              request_reference_id: eventsRes[i].id,
              community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
            },
            order: {
              id: 'DESC',
            },
            relations: ['community'],
          });

          eventsRes[i].community_request = requestEvent ? requestEvent : {};
          if (eventsRes[i].created_by) {
            const user = await firstValueFrom(
              this.userClient.send<any>('get_user_by_id', {
                userId: Number(eventsRes[i].created_by),
              }),
            );

            delete user.password;
            delete user.verification_code;
            delete user.reset_password_otp;
            const count = await this.attendEventRepository.count({
              where: {
                event: { id: eventsRes[i].id },
              },
            });
            eventsRes[i].member_counts = count;
            eventsRes[i].created_by == user.id ? true : false;
            eventsRes[i].created_by = user;

            const resTags: any = [];
            if (eventsRes[i].tags) {
              const checkTag = eventsRes[i].tags.split(',');
              for (let j = 0; j < checkTag.length; j++) {
                const interest = await firstValueFrom(
                  this.adminClient.send(
                    'get_basic_type_ids',
                    JSON.stringify(checkTag),
                  ),
                );
                resTags.push(interest);
              }
            }
            eventsRes[i].tags = resTags;
          }
        }
        return eventsRes;
      } else {
        return {
          status: 500,
          message: 'Events not found',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTrendingEvent(data: any) {
    try {
      const member = await this.attendEventRepository.query(
        `SELECT event_id as event,COUNT(id) as number_off_attendees FROM event_attendees GROUP BY event_id ORDER BY COUNT(id) DESC LIMIT ${data.take} OFFSET ${data.skip};`,
      );
      if (!member) {
        throw new HttpException(
          'EVENT_USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const memberRes: any = member;
      for (let i = 0; i < member.length; i++) {
        const events = await this.communityEventRepository.find({
          where: {
            id: member[i].event,
            status: EVENT_STATUS.ACCEPTED,
          },
          relations: ['event_timing', 'event_speakers'],
        });
        memberRes[i].event = events;
        for (let j = 0; j < events.length; j++) {
          const requestEvent = await this.communityRequestRepository.find({
            where: {
              request_reference_id: events[j].id,
              community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
            },
            order: {
              id: 'DESC',
            },
            relations: ['community'],
          });
          memberRes[i].community_request = requestEvent ? requestEvent : {};
        }
      }
      return memberRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async changeEventStatusAdmin(data: any, user_id: number) {
    try {
      const event = await this.communityEventRepository.findOne({
        where: {
          id: data.id,
        },
        relations: ['event_timing', 'event_speakers'],
      });

      if (!event) {
        return {
          status: 500,
          message: 'Event not found.',
        };
      }
      data.status = data.status;
      await this.communityEventRepository.save(data);

      return await this.getEventById(data.id, user_id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async inviteUsers(
    invites: InviteUsersToEventDto,
    user_id: number,
  ): Promise<any> {
    try {
      const event = await this.communityEventRepository.findOne({
        where: {
          id: invites.event_id,
        },
      });
      if (!event) {
        return {
          statusCode: 500,
          message: 'Event not found',
        };
      }
      const invitedByUser = await this.getUser(user_id);
      for (let i = 0; i < invites.users.length; i++) {
        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_email', {
            email: invites.users[i],
          }),
        );

        if (invitedUser.id) {
          const userSetting = await this.getUserSetting(Number(user_id));
          let sentNotification = true;
          let sentMail = true;
          if (userSetting.length) {
            for (let j = 0; j < userSetting.length; j++) {
              sentNotification =
                userSetting[j].setting.key ==
                  'community_event_push_notification' &&
                userSetting[j].setting.status == 'ACTIVE' &&
                userSetting[j].value == 'true'
                  ? true
                  : false;
              sentMail =
                userSetting[j].setting.key == 'community_email_notification' &&
                userSetting[j].setting.status == 'ACTIVE' &&
                userSetting[j].value == 'true'
                  ? true
                  : false;

              if (sentNotification == true) {
                const admin_notification = await firstValueFrom(
                  this.adminClient.send<any>(
                    'get_notification_by_type',
                    'EVENT_INVITE',
                  ),
                );
                const joinRequestNotification = {
                  title: admin_notification.notification_title
                    .replace('*user*', invitedUser.general_profile.first_name)
                    .replace(
                      '*event organizer*',
                      invitedByUser.general_profile.first_name,
                    )
                    .replace('*event title*', event.event_title),
                  content: admin_notification.notification_content
                    .replace('*user*', invitedUser.general_profile.first_name)
                    .replace(
                      '*event organizer*',
                      invitedByUser.general_profile.first_name,
                    )
                    .replace('*event title*', event.event_title),
                  type: admin_notification.notification_type,
                  notification_from: user_id,
                  notification_to: invitedUser.id,
                  payload: event,
                };

                await firstValueFrom(
                  this.notificationClient.send<any>(
                    'create_notification',
                    JSON.stringify(joinRequestNotification),
                  ),
                );
              }
              if (sentMail) {
                const payload: IMailPayload = {
                  template: 'INVITE_USER_TO_COMMUNITY_DYNAMIC',
                  payload: {
                    emails: [invitedUser.email],
                    data: {
                      community_name: event.event_title,
                      name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                      invite_by: `${invitedByUser.general_profile.first_name} ${invitedByUser.general_profile.last_name}`,
                      invitationLink: `${this.configService.get<string>(
                        'event_url',
                      )}/${event.id}`,
                    },
                    subject: `You got invite to join ${event.event_title} at hubbers`,
                  },
                };
                this.mailClient.emit('send_email', payload);
              }
            }
          }
        }
      }
      return {
        status: 200,
        message: 'Invite sent successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async searchCommunityEventAttendees(
    event_id: number,
    data: any,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      let where: any = {
        event: event_id,
      };
      if (data.search) {
        const userData = await this.attendEventRepository.query(
          `SELECT * from general_profile WHERE LOWER(first_name) LIKE LOWER('%${data.search}%') OR LOWER(last_name) LIKE LOWER('%${data.search}%')`,
        );
        const userIds = await this.arrayColumn(userData, 'user_id');
        where = {
          event: {
            id: event_id,
          },
          attendee: In(userIds),
        };
      }
      const eventAttendees: any = await this.attendEventRepository.find({
        where: where,
        take: data.limit,
        skip: skip,
        relations: ['event'],
      });

      if (!eventAttendees) {
        return {
          status: 500,
          message: 'No eventAttendees found.',
        };
      }

      for (let i = 0; i < eventAttendees.length; i++) {
        const user = await this.getUser(Number(eventAttendees[i].attendee));
        eventAttendees[i].attendee = user;
      }
      const total = await this.attendEventRepository.count({
        where: {
          event: {
            id: event_id,
          },
        },
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: eventAttendees,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
