/* eslint-disable prettier/prettier */
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateTopicDto,
  GetTopicDto,
  TopicFollowReactionDto,
  TopicReactionDto,
  UpdateTopicDto,
} from 'src/core/dtos/topic';
import {
  Community,
  CommunityReport,
  CommunityTopic,
  CommunityUser,
  LeaveCommunity,
  TopicLike,
  TopicFollow,
  CommunityEvent,
  CommunityGroup,
  GroupUsers,
  CommunityPost,
  CommunityTimeline,
} from 'src/database/entities';
import {
  AllowCommunityDto,
  CommunitySearchDto,
  InviteUsersToCommunityDto,
  JoinCommunityDto,
  JoinInvitedCommunityDto,
  StatusCommunityMemberDto,
  AssignTopicDto,
  CreateTopicAssignDto,
  SearchCommunityUserDto,
  LeaveCommunityDto,
  ReportCommunityDto,
  RemoveCommunityMemberDto,
  CommunityMaxRangeDto,
  CommunityAdvanceSearchDto,
} from '../core/dtos/community';
import { ICommunity, IMailPayload } from '../core/interfaces';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  COMMUNITY_INVITE_STATUS,
  COMMUNITY_REQUEST_STATUS,
  COMMUNITY_REQUEST_TYPE,
  COMMUNITY_STATUS,
  COMMUNITY_TYPE,
  COMMUNITY_USER_ROLE,
  FOLLOW_REACTION_TYPE,
  REACTION_TYPE,
  TOPIC_LOCATION,
  TOPIC_STATUS,
  TOPIC_TYPE,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { generateRandomNumber } from 'src/core/helper/random-number.helper';
import { ILike, In, Repository } from 'typeorm';
import { CommunityRequest } from 'src/database/entities/community-request.entity';
import { CommunityRequestDto } from 'src/core/dtos/community/community-request.dto';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { INVITE_STATUS } from 'src/core/dtos/topic/update-invite-users.dto';

@Injectable()
export class CommunityService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('TOKEN_SERVICE') private readonly tokenClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(TopicLike)
    private readonly topicLikeRepository: Repository<TopicLike>,
    @InjectRepository(TopicFollow)
    private readonly topicFollowRepository: Repository<TopicFollow>,
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(LeaveCommunity)
    private readonly leaveCommunityRepository: Repository<LeaveCommunity>,
    @InjectRepository(CommunityEvent)
    private readonly communityEventRepository: Repository<CommunityEvent>,
    @InjectRepository(CommunityReport)
    private readonly communityReportRepository: Repository<CommunityReport>,
    @InjectRepository(CommunityGroup)
    private readonly communityGroupRepository: Repository<CommunityGroup>,
    @InjectRepository(CommunityRequest)
    private readonly communityRequestRepository: Repository<CommunityRequest>,
    @InjectRepository(CommunityPost)
    private readonly communityPostRepository: Repository<CommunityPost>,
    @InjectRepository(GroupUsers)
    private readonly groupUserRepository: Repository<GroupUsers>,
    @InjectRepository(CommunityTimeline)
    private readonly timelineRepository: Repository<CommunityTimeline>,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    this.userClient.connect();
    this.mailClient.connect();
    this.tokenClient.connect();
    this.adminClient.connect();
    this.notificationClient.connect();
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

  public async createCommunity(
    data: any,
    file: any,
    user_id: number,
  ): Promise<any> {
    const {
      name,
      country,
      state,
      city,
      district,
      latitude,
      longitude,
      place_id,
      language,
      is_global,
      tag_line,
      description,
      status,
      is_published,
      community_type,
    } = data;

    try {
      let avatar;
      if (file) {
        avatar = await this.s3Service.uploadFile(file);
      }

      const newCommunity = new Community();
      newCommunity.name = name;
      newCommunity.country = country;
      newCommunity.state = state;
      newCommunity.city = city;
      newCommunity.district = district;
      newCommunity.latitude = latitude;
      newCommunity.longitude = longitude;
      newCommunity.place_id = place_id;
      newCommunity.avatar =
        avatar && avatar.Location
          ? avatar.Location
          : typeof data.avatar === 'string'
          ? data.avatar
          : null;
      newCommunity.language = language;
      newCommunity.is_global = is_global;
      newCommunity.tag_line = tag_line;
      newCommunity.description = description;
      newCommunity.is_published = is_published
        ? is_published
        : TRUE_FALSE.FALSE;
      newCommunity.invitation_code = await generateRandomNumber(7, true);
      newCommunity.community_created_by = user_id;
      newCommunity.status = status ? status : COMMUNITY_STATUS.PENDING;
      newCommunity.community_type = community_type;

      const create_community =
        await this.communityRepository.save(newCommunity);

      const newCommunityUser = new CommunityUser();
      newCommunityUser.community = create_community;
      newCommunityUser.user_id = user_id;
      newCommunityUser.role = COMMUNITY_USER_ROLE.HOST;
      newCommunityUser.invite_status = COMMUNITY_INVITE_STATUS.ACCEPTED;

      await this.communityUserRepository.save(newCommunityUser);
      const invitedUser = await this.getUser(Number(user_id));
      const admin_notification = await firstValueFrom(
        this.adminClient.send<any>(
          'get_notification_by_type',
          'COMMUNITY_CREATE',
        ),
      );
      const contestCreateNotification = {
        title: admin_notification.notification_title
          .replace('*user*', invitedUser.general_profile.first_name)
          .replace('*community name*', newCommunity.name),
        content: admin_notification.notification_content
          .replace('*user*', invitedUser.general_profile.first_name)
          .replace('*community name*', newCommunity.name),
        type: admin_notification.notification_type,
        notification_from: user_id,
        notification_to: 0,
        payload: newCommunity,
      };

      await firstValueFrom(
        this.notificationClient.send<any>(
          'create_notification',
          JSON.stringify(contestCreateNotification),
        ),
      );

      const payload: IMailPayload = {
        template: 'COMMUNITY_CREATE',
        payload: {
          emails: [invitedUser.email],
          data: {
            content: contestCreateNotification.content,
          },
          subject: contestCreateNotification.title,
        },
      };
      this.mailClient.emit('send_email', payload);

      return create_community;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async allCommunityMembersData(data: any): Promise<ICommunity[] | any> {
    try {
      const communityMembers = await this.communityUserRepository.find({
        relations: ['community'],
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
      });

      if (!communityMembers) {
        throw new HttpException(
          'COMMUNITY_USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const memberRes: any = [...communityMembers];
      for (let i = 0; i < memberRes.length; i++) {
        const user = await this.getUser(Number(memberRes[i].user_id));
        delete memberRes[i].user_id;
        memberRes[i].user = user;
      }

      if (memberRes.length > 0) {
        return memberRes;
      } else {
        return {
          status: 500,
          message: 'No community members found',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getCommunityMemberDataById(id: number): Promise<any> {
    try {
      const communityMember = await this.communityUserRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!communityMember) {
        return {
          status: 500,
          message: 'Community User Not Found',
        };
      }

      const user = await this.getUser(Number(communityMember.user_id));
      const memberRes: any = communityMember;

      delete memberRes.user_id;
      memberRes.user = user;

      return memberRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async deleteCommunityMember(id): Promise<any> {
    try {
      const communityMember = await this.communityUserRepository.findOne({
        where: {
          id: id,
        },
        relations: ['community'],
      });

      if (!communityMember) {
        throw new HttpException(
          'COMMUNITY_USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.communityUserRepository.delete(id);

      const user = await this.getUser(communityMember.user_id);
      communityMember.user_id = user.id;
      const userSetting = await this.getUserSetting(communityMember.user_id);
      let sentNotification = true;
      if (userSetting.length) {
        for (let i = 0; i < userSetting.length; i++) {
          sentNotification =
            userSetting[i].setting.key == 'community_push_notification' &&
            userSetting[i].setting.status == 'ACTIVE' &&
            userSetting[i].value == 'true'
              ? true
              : false;

          if (sentNotification == true) {
            const admin_notification = await firstValueFrom(
              this.adminClient.send<any>(
                'get_notification_by_type',
                'REMOVE_COMMUNITY_REQUEST',
              ),
            );
            const joinRequestNotification = {
              title: admin_notification.notification_title.replace(
                '*community name*',
                communityMember.community.name,
              ),
              content: admin_notification.notification_content.replace(
                '*community name*',
                communityMember.community.name,
              ),
              type: admin_notification.notification_type,
              notification_from: 0,
              notification_to: communityMember.user_id,
              payload: communityMember,
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
        message: 'Community Member deleted',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async joinCommunity(id: number, user_id: number): Promise<any> {
    try {
      const community = await this.communityRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!community) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }

      const checkUser = await this.communityUserRepository.findOne({
        where: {
          community: {
            id: id,
          },
          user_id: user_id,
        },
      });
      if (
        checkUser &&
        checkUser.invite_status == COMMUNITY_INVITE_STATUS.ACCEPTED
      ) {
        return {
          status: 500,
          message: 'User already joined community.',
        };
      }

      if (
        checkUser &&
        checkUser.invite_status == COMMUNITY_INVITE_STATUS.PENDING
      ) {
        return {
          status: 500,
          message: `You've already requested to join this community, Please wait for Host or Moderator to approve your request.`,
        };
      }
      if (checkUser) {
        await this.communityUserRepository.delete(checkUser.id);
      }
      const newCommunityUser = new CommunityUser();
      newCommunityUser.community = community;
      newCommunityUser.user_id = user_id;
      newCommunityUser.invite_status =
        community.community_type === COMMUNITY_TYPE.PUBLIC
          ? COMMUNITY_INVITE_STATUS.ACCEPTED
          : COMMUNITY_INVITE_STATUS.PENDING;
      newCommunityUser.role = COMMUNITY_USER_ROLE.MEMBER;

      await this.communityUserRepository.save(newCommunityUser);

      const invitedUser = await this.getUser(Number(user_id));
      if (community.community_type === COMMUNITY_TYPE.PRIVATE) {
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'COMMUNITY_JOIN_REQUEST',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*community name*', community.name),
          content: admin_notification.notification_content
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*community name*', community.name),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: community.community_created_by,
          payload: newCommunityUser,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );
      } else {
        const communityHost = await this.getUser(
          Number(community.community_created_by),
        );
        const userSetting = await this.getUserSetting(Number(user_id));
        let sentNotification = true;
        let sentMail = true;
        if (userSetting.length) {
          for (let i = 0; i < userSetting.length; i++) {
            sentNotification =
              userSetting[i].setting.key == 'community_new_member_push' &&
              userSetting[i].setting.status == 'ACTIVE' &&
              userSetting[i].value == 'true'
                ? true
                : false;
            sentMail =
              userSetting[i].setting.key == 'community_email_notification' &&
              userSetting[i].setting.status == 'ACTIVE' &&
              userSetting[i].value == 'true'
                ? true
                : false;

            const admin_notification = await firstValueFrom(
              this.adminClient.send<any>(
                'get_notification_by_type',
                'COMMUNITY_JOIN',
              ),
            );

            const joinRequestNotification = {
              title: admin_notification.notification_title
                .replace('*user*', invitedUser.general_profile.first_name)
                .replace('*community name*', community.name),
              content: admin_notification.notification_content
                .replace('*user*', invitedUser.general_profile.first_name)
                .replace('*community name*', community.name),
              type: admin_notification.notification_type,
              notification_from: user_id,
              notification_to: community.community_created_by,
              payload: newCommunityUser,
            };
            if (sentNotification == true) {
              await firstValueFrom(
                this.notificationClient.send<any>(
                  'create_notification',
                  JSON.stringify(joinRequestNotification),
                ),
              );
            }
            console.log('communityHost', communityHost);
            console.log('communityHost.email', communityHost.email);

            if (sentMail) {
              const payload: IMailPayload = {
                template: 'JOIN_REQUEST',
                payload: {
                  emails: [communityHost.email],
                  data: {
                    content: joinRequestNotification.content,
                    user_name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                    link: `${this.configService.get<string>(
                      'community_join_request_url',
                    )}/${community.id}/members/${newCommunityUser.id}`,
                  },
                  subject: joinRequestNotification.title,
                },
              };

              this.mailClient.emit('send_email', payload);
            }
          }
        }
      }
      return {
        status: 200,
        message: 'Community Joined Request Sent successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async joinCommunities(
    communities: JoinCommunityDto,
    user_id: number,
  ): Promise<any> {
    try {
      for (let i = 0; i < communities.communities.length; i++) {
        const community = await this.communityRepository.findOne({
          where: {
            id: communities.communities[i],
          },
        });

        const checkUser = await this.communityUserRepository.findOne({
          where: {
            community: {
              id: community.id,
            },
            user_id: user_id,
          },
        });
        if (checkUser) {
          return {
            status: 500,
            message: 'User already joined community.',
          };
        }

        const newCommunityUser = new CommunityUser();
        newCommunityUser.community = community;
        newCommunityUser.user_id = user_id;
        newCommunityUser.role = COMMUNITY_USER_ROLE.MEMBER;
        newCommunityUser.invite_status =
          community.community_type === COMMUNITY_TYPE.PUBLIC
            ? COMMUNITY_INVITE_STATUS.ACCEPTED
            : COMMUNITY_INVITE_STATUS.PENDING;
        await this.communityUserRepository.save(newCommunityUser);

        const invitedUser = await this.getUser(Number(user_id));

        let communityHost: any;
        if (community.community_created_by) {
          communityHost = await this.getUser(
            Number(community.community_created_by),
          );
        }
        const userSetting = await this.getUserSetting(Number(user_id));
        let sentNotification = true;
        let sentMail = true;
        if (userSetting.length) {
          for (let j = 0; j < userSetting.length; j++) {
            sentNotification =
              userSetting[j].setting.key == 'community_push_notification' &&
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

            const admin_notification = await firstValueFrom(
              this.adminClient.send<any>(
                'get_notification_by_type',
                'COMMUNITY_JOIN_REQUEST',
              ),
            );

            const joinRequestNotification = {
              title: admin_notification.notification_title
                .replace('*user*', invitedUser.general_profile.first_name)
                .replace('*community name*', community.name),
              content: admin_notification.notification_content
                .replace('*user*', invitedUser.general_profile.first_name)
                .replace('*community name*', community.name),
              type: admin_notification.notification_type,
              notification_from: user_id,
              notification_to: community.community_created_by,
              payload: newCommunityUser,
            };
            if (sentNotification == true) {
              await firstValueFrom(
                this.notificationClient.send<any>(
                  'create_notification',
                  JSON.stringify(joinRequestNotification),
                ),
              );
            }
            if (sentMail) {
              const payload: IMailPayload = {
                template: 'JOIN_REQUEST',
                payload: {
                  emails: [communityHost.email],
                  data: {
                    content: joinRequestNotification.content,
                    user_name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                    link: `${this.configService.get<string>(
                      'community_join_request_url',
                    )}/${community.id}/requests/${newCommunityUser.id}`,
                  },
                  subject: joinRequestNotification.title,
                },
              };
              this.mailClient.emit('send_email', payload);
            }
          }
        }
      }

      return {
        status: 200,
        message: 'Community Joined successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllCommunities(
    data: any,
    user_id: number,
  ): Promise<ICommunity[] | any> {
    try {
      let community = null;
      if (user_id != 0) {
        community = await this.communityRepository
          .createQueryBuilder('community')
          .leftJoinAndSelect('community.community_users', 'community_users')
          .where(
            'community.status = :status AND community.is_published = :published AND community.community_type != :community_type',
            {
              status: COMMUNITY_STATUS.ACCEPTED,
              published: TRUE_FALSE.TRUE,
              community_type: COMMUNITY_TYPE.SECRET,
            },
          )
          .orderBy('community.id', 'DESC')
          .take(data.take)
          .skip(data.skip)
          .getMany();
      } else {
        community = await this.communityRepository
          .createQueryBuilder('community')
          .leftJoinAndSelect('community.community_users', 'community_users')
          .orderBy('community.id', 'DESC')
          .take(data.take)
          .skip(data.skip)
          .getMany();
      }

      if (!community || community.length <= 0) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }

      if (community.length > 0) {
        const communitiesRes: any = [...community];
        for (let i = 0; i < communitiesRes.length; i++) {
          if (user_id != 0) {
            const community_users = [];
            for (let j = 0; j < communitiesRes[i].community_users.length; j++) {
              const element = communitiesRes[i].community_users[j];
              if (element.invite_status != COMMUNITY_INVITE_STATUS.REJECTED) {
                community_users.push(element);
              }
            }
            communitiesRes[i].community_users = community_users;
          }
          if (communitiesRes[i].country) {
            try {
              communitiesRes[i].country = await firstValueFrom(
                this.adminClient.send<any>(
                  'get_country_by_id',
                  communitiesRes[i].country,
                ),
              );
            } catch (err) {
              console.log('Country err -->', err);
            }
          }

          if (communitiesRes[i].community_created_by) {
            try {
              const user = await this.getUser(
                Number(communitiesRes[i].community_created_by),
              );

              communitiesRes[i].community_created_by = user;
            } catch (error) {
              console.log('community_created_by err -->', error);
            }
          }

          if (communitiesRes[i].language) {
            try {
              communitiesRes[i].language = await firstValueFrom(
                this.adminClient.send<any>('get_language_by_id', {
                  id: communitiesRes[i].language,
                }),
              );
            } catch (error) {
              console.log('language err -->', error);
            }
          }

          communitiesRes[i].users_joined =
            communitiesRes[i].community_users.length;

          if (user_id > 0) {
            for (let j = 0; j < communitiesRes[i].community_users.length; j++) {
              const currUser = this.findObject(
                communitiesRes[i].community_users,
                user_id,
                'val',
              );

              communitiesRes[i].is_host =
                currUser && currUser.role === 'HOST' ? true : false;

              communitiesRes[i].is_moderator =
                currUser && currUser.role === 'MODERATOR' ? true : false;

              communitiesRes[i].is_community_leader =
                currUser && currUser.role === 'COMMUNITY_LEADER' ? true : false;

              communitiesRes[i].is_member =
                currUser && currUser.invite_status === 'ACCEPTED'
                  ? true
                  : false;

              communitiesRes[i].is_rejected =
                currUser && currUser.invite_status === 'REJECTED'
                  ? true
                  : false;
              communitiesRes[i].is_requested =
                currUser && currUser.invite_status === 'PENDING' ? true : false;
            }
          }
        }

        return communitiesRes || [];
      } else {
        return {
          status: 500,
          message: 'No community found',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getOpenAllCommunities(data: any): Promise<ICommunity[] | any> {
    try {
      let community = null;
      community = await this.communityRepository
        .createQueryBuilder('community')
        .leftJoinAndSelect('community.community_users', 'community_users')
        .orderBy('community.id', 'DESC')
        .take(data.take)
        .skip(data.skip)
        .where('is_published = :publish AND status = :status', {
          publish: TRUE_FALSE.TRUE,
          status: COMMUNITY_STATUS.ACCEPTED,
        })
        .getMany();

      if (!community || community.length <= 0) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }

      if (community.length > 0) {
        const communitiesRes: any = [...community];
        for (let i = 0; i < communitiesRes.length; i++) {
          if (communitiesRes[i].country) {
            try {
              communitiesRes[i].country = await firstValueFrom(
                this.adminClient.send<any>(
                  'get_country_by_id',
                  communitiesRes[i].country,
                ),
              );
            } catch (err) {
              console.log('Country err -->', err);
            }
          }

          if (communitiesRes[i].community_created_by) {
            try {
              const user = await this.getUser(
                Number(communitiesRes[i].community_created_by),
              );

              communitiesRes[i].community_created_by = user;
            } catch (error) {
              console.log('community_created_by err -->', error);
            }
          }

          if (communitiesRes[i].language) {
            try {
              communitiesRes[i].language = await firstValueFrom(
                this.adminClient.send<any>('get_language_by_id', {
                  id: communitiesRes[i].language,
                }),
              );
            } catch (error) {
              console.log('language err -->', error);
            }
          }

          communitiesRes[i].users_joined =
            communitiesRes[i].community_users.length;
        }

        return communitiesRes || [];
      } else {
        return {
          status: 500,
          message: 'No community found',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getAllCommunityMembers(
    id: number,
    data: PaginationDto,
    user_id: number,
  ): Promise<ICommunity[] | any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const community = await this.communityRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!community) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }
      const where: any =
        user_id === 0
          ? { community: { id: community.id } }
          : {
              community: { id: community.id },
              invite_status: INVITE_STATUS.ACCEPTED,
            };

      const communityMember = await this.communityUserRepository.find({
        where: { ...where },
        take: data.limit,
        skip: skip,
        relations: ['community'],
      });

      if (!communityMember.length) {
        return {
          status: 500,
          message: 'No community member found.',
        };
      }
      const communityRes: any = [...communityMember];
      const community_leader = [];
      const moderators = [];
      const host = [];
      let things_in_common = [];

      for (let i = 0; i < communityRes.length; i++) {
        const createdBy = await this.getUser(Number(communityRes[i].user_id));
        communityRes[i].user_id = createdBy;
        if (communityRes[i].role == COMMUNITY_USER_ROLE.COMMUNITY_LEADER) {
          community_leader.push(communityRes[i]);
        }
        if (communityRes[i].role == COMMUNITY_USER_ROLE.MODERATOR) {
          moderators.push(communityRes[i]);
        }
        if (communityRes[i].role == COMMUNITY_USER_ROLE.HOST) {
          host.push(communityRes[i]);
        }

        const requestGroups = await this.communityRequestRepository.find({
          where: {
            community: { id: id },
            community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
          },
        });

        const refId = await this.arrayColumn(
          requestGroups,
          'request_reference_id',
        );
        const groups = await this.communityGroupRepository.find({
          where: {
            id: In(refId),
          },
        });

        if (groups.length) {
          const groupIds = await this.arrayColumn(groups, 'id');
          things_in_common = await this.groupUserRepository.find({
            where: {
              group: {
                id: In(groupIds),
              },
            },
          });
        }
      }

      const total = await this.communityUserRepository.count({
        where: { ...where },
      });

      const totalPages = Math.ceil(total / data.limit);

      return {
        community_leader: community_leader,
        moderators: moderators,
        host: host,
        things_in_common: things_in_common,
        all_members: communityRes,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  public async getCommunityMembers(id: number): Promise<ICommunity[] | any> {
    try {
      const whereRes =
        id < 0 || id == null
          ? {}
          : {
              id: id,
            };

      const community = await this.communityRepository.findOne({
        where: {
          ...whereRes,
        },
      });

      if (!community) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }
      const wheres =
        id < 0 || id == null
          ? {}
          : {
              community: { id: community.id },
            };

      const communityMember = await this.communityUserRepository.find({
        where: { ...wheres },
        relations: ['community'],
      });

      if (!communityMember.length) {
        return {
          status: 500,
          message: 'No community member found.',
        };
      }
      const communityRes: any = [...communityMember];
      const community_leader = [];
      const moderators = [];
      const host = [];
      let things_in_common = [];

      for (let i = 0; i < communityRes.length; i++) {
        const createdBy = await this.getUser(Number(communityRes[i].user_id));
        communityRes[i].user_id = createdBy;
        if (communityRes[i].role == COMMUNITY_USER_ROLE.COMMUNITY_LEADER) {
          community_leader.push(communityRes[i]);
        }
        if (communityRes[i].role == COMMUNITY_USER_ROLE.MODERATOR) {
          moderators.push(communityRes[i]);
        }
        if (communityRes[i].role == COMMUNITY_USER_ROLE.HOST) {
          host.push(communityRes[i]);
        }

        const requestGroups = await this.communityRequestRepository.find({
          where: {
            ...wheres,
            community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
          },
        });

        const refId = await this.arrayColumn(
          requestGroups,
          'request_reference_id',
        );
        const groups = await this.communityGroupRepository.find({
          where: {
            id: In(refId),
          },
        });

        if (groups.length) {
          const groupIds = await this.arrayColumn(groups, 'id');
          things_in_common = await this.groupUserRepository.find({
            where: {
              group: {
                id: In(groupIds),
              },
            },
          });
        }
      }

      const total = await this.communityUserRepository.count({
        where: { ...wheres },
      });
      return {
        community_leader: community_leader,
        moderators: moderators,
        host: host,
        things_in_common: things_in_common,
        all_members: communityRes,
        count: total,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async getSingleCommunity(id: number, user_id: number): Promise<any> {
    try {
      const community: any = await this.communityRepository
        .createQueryBuilder('community')
        .leftJoinAndSelect('community.community_users', 'community_users')
        .where('community.id = :id', { id: id })
        .andWhere(
          'community_users.invite_status != :invite_status AND community_users.invite_status != :pending_invite_status',
          {
            invite_status: COMMUNITY_INVITE_STATUS.REJECTED,
            pending_invite_status: COMMUNITY_INVITE_STATUS.PENDING,
          },
        )
        .getOne();

      if (!community) {
        return {
          statusCode: 500,
          message: 'No community found',
        };
      }
      if (user_id != 0) {
        if (community.is_published != TRUE_FALSE.TRUE) {
          return {
            statusCode: 500,
            message: 'Community is not published.',
          };
        }
        if (community.status == COMMUNITY_STATUS.PENDING) {
          return {
            statusCode: 500,
            message: 'Community is pending.',
          };
        }
        if (community.status == COMMUNITY_STATUS.SUSPENDED) {
          return {
            statusCode: 500,
            message: 'Community is suspended.',
          };
        }
        if (
          community.community_type == COMMUNITY_TYPE.SECRET &&
          community.community_created_by != user_id
        ) {
          return {
            statusCode: 500,
            message: 'Community is secret.',
          };
        }
      }
      //TODO: REMOVE IF NO NEED TO USE
      // if (user_id > 0) {
      //   const checkUser = this.findObject(
      //     community.community_users,
      //     user_id,
      //     'bool',
      //   );
      //   if (!checkUser) {
      //     return {
      //       message: "You're not part of this community.",
      //     };
      //   }
      // }
      const communityRes: any = community;
      if (communityRes.community_created_by) {
        const createdByUser = await this.getUser(
          Number(community.community_created_by),
        );
        communityRes.community_created_by = createdByUser;
      }

      if (community.country) {
        const country = await firstValueFrom(
          this.adminClient.send<any>('get_country_by_id', community.country),
        );
        communityRes.country = country;
      }
      if (community.language) {
        const language = await firstValueFrom(
          this.adminClient.send<any>('get_language_by_id', {
            id: community.language,
          }),
        );
        communityRes.language = language;
      }
      if (communityRes && communityRes.id) {
        try {
          const investor = await firstValueFrom(
            this.adminClient.send<any>('get_zone_by_community_id', {
              id: communityRes.id,
            }),
          );
          if (investor && investor.length > 0) {
            communityRes.is_investor = true;
          } else {
            communityRes.is_investor = false;
          }
        } catch (error) {
          console.log('language err -->', error);
        }
      }
      if (user_id > 0) {
        const currUser = this.findObject(
          community.community_users,
          user_id,
          'val',
        );
        communityRes.is_host =
          currUser && currUser.role === 'HOST' ? true : false;

        communityRes.is_moderator =
          currUser && currUser.role === 'MODERATOR' ? true : false;

        communityRes.is_community_leader =
          currUser && currUser.role === 'COMMUNITY_LEADER' ? true : false;

        communityRes.is_member =
          currUser && currUser.invite_status === 'ACCEPTED' ? true : false;

        communityRes.is_requested =
          currUser && currUser.invite_status === 'PENDING' ? true : false;
      }

      return communityRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  public async getCommunityById(id: number): Promise<any> {
    try {
      const community: any = await this.communityRepository.findOne({
        where: { id: id },
      });

      if (!community) {
        return {
          statusCode: 500,
          message: 'No community found',
        };
      }

      return community;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getSingleCommunityForInvestor(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const community: any = await this.communityRepository
        .createQueryBuilder('community')
        .leftJoinAndSelect('community.community_users', 'community_users')
        .where('community.id = :id', { id: id })
        .getOne();
      if (!community) {
        return {
          statusCode: 500,
          message: 'No community found',
        };
      }
      if (
        community &&
        community.community_type == COMMUNITY_TYPE.SECRET &&
        community.community_created_by != user_id
      ) {
        return {
          statusCode: 500,
          message: 'community is secret',
        };
      }
      //TODO: REMOVE IF NO NEED TO USE
      // if (user_id > 0) {
      //   const checkUser = this.findObject(
      //     community.community_users,
      //     user_id,
      //     'bool',
      //   );
      //   if (!checkUser) {
      //     return {
      //       message: "You're not part of this community.",
      //     };
      //   }
      // }
      const communityRes: any = community;
      if (communityRes.community_created_by) {
        const createdByUser = await this.getUser(
          Number(community.community_created_by),
        );
        communityRes.community_created_by = createdByUser;
      }

      if (community.country) {
        const country = await firstValueFrom(
          this.adminClient.send<any>('get_country_by_id', community.country),
        );
        communityRes.country = country;
      }
      if (community.language) {
        const language = await firstValueFrom(
          this.adminClient.send<any>('get_language_by_id', {
            id: community.language,
          }),
        );
        communityRes.language = language;
      }
      return communityRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async searchCommunity(
    data: CommunitySearchDto,
    user_id: number,
  ): Promise<any> {
    try {
      const community: any = await this.communityRepository
        .createQueryBuilder('community')
        .where(
          '(LOWER(community.name) LIKE LOWER(:name) OR ' +
            'LOWER(community.city) LIKE LOWER(:city) OR ' +
            'LOWER(community.district) LIKE LOWER(:district)) AND ' +
            'community.status = :status AND ' +
            'community.is_published = :published AND ' +
            'community.community_type != :community_type',
          {
            data: `%${data.name}%`,
            name: `%${data.name}%`,
            city: `%${data.name}%`,
            district: `%${data.name}%`,
            status: COMMUNITY_STATUS.ACCEPTED,
            published: TRUE_FALSE.TRUE,
            community_type: COMMUNITY_TYPE.SECRET,
          },
        )
        .getMany();

      for (let i = 0; i < community.length; i++) {
        const count = await this.communityUserRepository.count({
          where: {
            community: { id: community[i].id },
            invite_status: COMMUNITY_INVITE_STATUS.ACCEPTED,
          },
        });
        if (user_id > 0) {
          const community_user = await this.communityUserRepository.findOne({
            where: {
              community: {
                id: community[i].id,
              },
              user_id: user_id,
            },
          });

          community[i].is_host =
            community_user && community_user.role === 'HOST' ? true : false;

          community[i].is_moderator =
            community_user?.role === COMMUNITY_USER_ROLE.MODERATOR
              ? true
              : false;
          if (
            community_user?.invite_status === COMMUNITY_INVITE_STATUS.ACCEPTED
          ) {
            community[i].is_member = true;
          } else {
            community[i].is_member = false;
          }

          if (
            community_user?.invite_status === COMMUNITY_INVITE_STATUS.REJECTED
          ) {
            community[i].is_rejected = true;
          } else {
            community[i].is_rejected = false;
          }

          if (
            community_user?.invite_status === COMMUNITY_INVITE_STATUS.PENDING
          ) {
            community[i].is_requested = true;
          } else {
            community[i].is_requested = false;
          }
        }
        community[i].member_count = count;
      }

      return community;
    } catch (err) {
      console.log('ERR -->', err);
      throw new InternalServerErrorException(err);
    }
  }
  public async getCommunityRequestFilter(data: CommunityRequestDto) {
    const whereConn: any = {
      where: {
        community: {
          id: data.community_id,
        },
      },
      order: {
        id: 'DESC',
      },
      relation: ['community'],
    };

    if (data.request_status) {
      whereConn.where.community_request_status = data.request_status;
    }
    if (data.request_type) {
      whereConn.where.community_request_type = data.request_type;
    }
    const communityRequest: any =
      await this.communityRequestRepository.find(whereConn);
    for (let i = 0; i < communityRequest.length; i++) {
      if (
        communityRequest[i].community_request_type ==
        COMMUNITY_REQUEST_TYPE.EVENT
      ) {
        communityRequest[i].request_reference_id =
          await this.communityEventRepository.findOne({
            where: {
              id: communityRequest[i].request_reference_id,
            },
          });
      }
      if (
        communityRequest[i].community_request_type ==
        COMMUNITY_REQUEST_TYPE.GROUP
      ) {
        communityRequest[i].request_reference_id =
          await this.communityGroupRepository.findOne({
            where: {
              id: communityRequest[i].request_reference_id,
            },
          });
      }
      if (
        communityRequest[i].community_request_type ==
        COMMUNITY_REQUEST_TYPE.TOPIC
      ) {
        communityRequest[i].request_reference_id =
          await this.communityTopicRepository.findOne({
            where: {
              id: communityRequest[i].request_reference_id,
            },
          });
      }
    }
    return communityRequest;
  }

  public async updateCommunityRequest(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const community = await this.communityRepository.findOne({
        where: { id: data.community_id },
      });
      if (!community) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }
      delete data.community_id;
      data.community = community;
      const communityRequest = await this.communityRequestRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });

      if (!communityRequest) {
        return {
          statusCode: 500,
          message: 'Community Request not found',
        };
      }

      await this.communityRequestRepository.update(id, data);
      return {
        status: 500,
        message: 'Community Request Updated Successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async advanceSearchCommunity(
    data: CommunityAdvanceSearchDto,
    user_id: number,
  ): Promise<any> {
    try {
      if (Object.keys(data).length === 0) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }
      const communityQuery: any =
        await this.communityRepository.createQueryBuilder('community');
      communityQuery.where(
        'community.status = :status AND community.is_published = :published',
        {
          status: COMMUNITY_STATUS.ACCEPTED,
          published: TRUE_FALSE.TRUE,
        },
      );
      if (data.name) {
        communityQuery.andWhere(
          '(LOWER(community.name) LIKE LOWER(:data) OR ' +
            'LOWER(community.city) LIKE LOWER(:city) OR ' +
            'LOWER(community.district) LIKE LOWER(:district))',
          {
            data: `%${data.name}%`,
            city: `%${data.name}%`,
            district: `%${data.name}%`,
          },
        );
      }
      if (data.community_type) {
        communityQuery.andWhere(`community_type = :community_type`, {
          community_type: data.community_type,
        });
      }
      if (data.is_global) {
        communityQuery.andWhere(`is_global = :is_global`, {
          is_global: data.is_global,
        });
      }
      if (data.country) {
        communityQuery.andWhere(`country = :country`, {
          country: data.country,
        });
      }
      if (data.longitude && data.latitude) {
        const earthRadiusKm = 6371;
        const distanceKm = 50;
        const longitude = parseFloat(data.longitude);
        const latitude = parseFloat(data.latitude);
        const maxLongitude =
          longitude +
          ((distanceKm / earthRadiusKm) * (180 / Math.PI)) /
            Math.cos((latitude * Math.PI) / 180);
        const minLongitude =
          longitude -
          ((distanceKm / earthRadiusKm) * (180 / Math.PI)) /
            Math.cos((latitude * Math.PI) / 180);
        const maxLatitude =
          latitude + (distanceKm / earthRadiusKm) * (180 / Math.PI);
        const minLatitude =
          latitude - (distanceKm / earthRadiusKm) * (180 / Math.PI);

        communityQuery.andWhere(
          `community.longitude BETWEEN :minLongitude AND :maxLongitude`,
          {
            minLongitude,
            maxLongitude,
          },
        );

        communityQuery.andWhere(
          `community.latitude BETWEEN :minLatitude AND :maxLatitude`,
          {
            minLatitude,
            maxLatitude,
          },
        );
      }

      const community: any = await communityQuery.getMany();

      if (!community || community.length === 0) {
        return {
          status: 200,
          message: 'No community found',
        };
      }

      for (let i = 0; i < community.length; i++) {
        if (user_id > 0) {
          if (
            community[i].community_type == COMMUNITY_TYPE.SECRET &&
            community[i].community_created_by != user_id
          ) {
            community.splice(i, 1);
            i--;
          } else {
            const community_user = await this.communityUserRepository.findOne({
              where: {
                community: {
                  id: community[i].id,
                },
                user_id: user_id,
              },
            });

            community[i].member_count =
              await this.communityUserRepository.count({
                where: {
                  community: {
                    id: community[i].id,
                  },
                  invite_status: COMMUNITY_INVITE_STATUS.ACCEPTED,
                },
              });

            community[i].is_host =
              community_user && community_user.role === 'HOST' ? true : false;

            community[i].is_moderator =
              community_user?.role === COMMUNITY_USER_ROLE.MODERATOR
                ? true
                : false;
            if (
              community_user?.invite_status === COMMUNITY_INVITE_STATUS.ACCEPTED
            ) {
              community[i].is_member = true;
            } else {
              community[i].is_member = false;
            }

            if (
              community_user?.invite_status === COMMUNITY_INVITE_STATUS.REJECTED
            ) {
              community[i].is_rejected = true;
            } else {
              community[i].is_rejected = false;
            }

            if (
              community_user?.invite_status === COMMUNITY_INVITE_STATUS.PENDING
            ) {
              community[i].is_requested = true;
            } else {
              community[i].is_requested = false;
            }
          }
        }
      }

      return community;
    } catch (err) {
      console.log('ERR -->', err);
      throw new InternalServerErrorException(err);
    }
  }
  public async getCommunityPartners(id: number): Promise<any> {
    try {
      const community = await this.communityRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!community) {
        return {
          status: 500,
          message: 'Community Not Found',
        };
      }
      const user = await firstValueFrom(
        this.userClient.send('get_community_partners', community.id),
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async searchCommunityByDistrict(
    data: CommunitySearchDto,
  ): Promise<any> {
    try {
      const community = await this.communityRepository.find({
        where: {
          district: ILike(`%${data.name}%`),
        },
      });
      return community;
    } catch (err) {
      console.log('ERR -->', err);
      throw new InternalServerErrorException(err);
    }
  }

  public async updateCommunity(
    id: number,
    data: any,
    user_id: number,
    file: any,
  ): Promise<any> {
    try {
      let avatar: any;

      if (file) {
        avatar = await this.s3Service.uploadFile(file);
        data.avatar = avatar.Location;
      }

      const community = await this.communityRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!community) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }

      delete data.created_by;

      await this.communityRepository.update(id, data);
      const updatedCommunity = await this.communityRepository.findOne({
        where: {
          id: id,
        },
      });
      return updatedCommunity;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async deleteCommunity(id, user_id): Promise<any> {
    try {
      const community = this.communityRepository.find({
        where: {
          id,
          community_created_by: user_id,
        },
      });

      if (!community) {
        throw new HttpException(
          'COMMUNITY_ACCESS_DENIED',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.communityRepository.delete(id);

      return {
        status: 200,
        message: 'Community deleted',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteAnyCommunity(id): Promise<any> {
    try {
      const community = this.communityRepository.find({
        where: {
          id: id,
        },
      });

      if (!community) {
        throw new HttpException(
          'COMMUNITY_ACCESS_DENIED',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.communityRepository.delete(id);

      return {
        status: 200,
        message: 'Community deleted',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createTopic(
    data: CreateTopicDto,
    user_id: number,
  ): Promise<any> {
    try {
      let community: any = null;
      let group = null;
      if (data.topic_location === TOPIC_LOCATION.COMMUNITY) {
        community = await this.communityRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (!community) {
          throw new HttpException(
            'COMMUNITY_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      if (data.topic_location === TOPIC_LOCATION.GROUP) {
        group = await this.communityGroupRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (!group) {
          throw new HttpException(
            'GROUP_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      const createTopic = new CommunityTopic();
      createTopic.name = data.name;
      createTopic.description = data.description;
      createTopic.created_by = user_id;
      createTopic.topic_location = data.topic_location;
      createTopic.group = group ? group : null;
      createTopic.status = TOPIC_STATUS.ACCEPTED;
      const topic = await this.communityTopicRepository.save(createTopic);

      const invitedUser = await this.getUser(Number(user_id));
      if (community) {
        const communityRequest = new CommunityRequest();
        communityRequest.community = community;
        communityRequest.created_by = user_id;
        communityRequest.community_request_status =
          COMMUNITY_REQUEST_STATUS.PENDING;
        communityRequest.community_request_type = COMMUNITY_REQUEST_TYPE.TOPIC;
        communityRequest.request_reference_id = createTopic.id;
        await this.communityRequestRepository.save(communityRequest);

        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'COMMUNITY_TOPIC_CREATE',
          ),
        );
        const contestCreateNotification = {
          title: admin_notification.notification_title
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*community name*', community.name),
          content: admin_notification.notification_content
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*community name*', community.name),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: community.community_created_by,
          payload: communityRequest,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(contestCreateNotification),
          ),
        );
      }

      return topic;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getAllTopics(
    data: any,
    user_id: number,
  ): Promise<GetTopicDto[]> {
    try {
      const where =
        user_id == 0
          ? ''
          : {
              status: TOPIC_STATUS.ACCEPTED,
            };
      const topics = await this.communityTopicRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
        where: { ...where },
      });
      const topicsRes: any = [...topics];
      for (let i = 0; i < topics.length; i++) {
        const likes = await this.topicLikeRepository.find({
          where: {
            community_topic: {
              id: topics[i].id,
            },
          },
        });
        topicsRes[i].likes = likes.filter(
          (i) => i.reaction_type === REACTION_TYPE.LIKE,
        ).length;

        topicsRes[i].dislikes = likes.filter(
          (i) => i.reaction_type === REACTION_TYPE.DISLIKE,
        ).length;

        const follow = await this.topicFollowRepository.find({
          where: {
            community_topic: {
              id: topics[i].id,
            },
          },
        });
        topicsRes[i].follow = follow.filter(
          (i) => i.reaction_type === FOLLOW_REACTION_TYPE.FOLLOW,
        ).length;

        topicsRes[i].unfollow = follow.filter(
          (i) => i.reaction_type === FOLLOW_REACTION_TYPE.UNFOLLOW,
        ).length;
      }

      if (!topics) {
        throw new HttpException(
          'TOPICS_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const topicRes: any = [...topics];

      for (let i = 0; i < topicRes.length; i++) {
        const user = await this.getUser(topicRes[i].created_by);
        topicRes[i].created_by = user;
      }
      return topics || [];
    } catch (err) {
      console.log('err -->', err);
      throw new InternalServerErrorException(err);
    }
  }

  public async getTopic(id: number, user_id: number): Promise<any> {
    try {
      const where =
        user_id == 0
          ? {
              id,
            }
          : {
              id,
              status: TOPIC_STATUS.ACCEPTED,
            };
      const topic = await this.communityTopicRepository.findOne({
        where,
      });

      if (!topic) {
        return {
          status: 500,
          message: 'Topic Not Found',
        };
      }
      const topics: any = [topic];
      for (let i = 0; i < topics.length; i++) {
        const likes = await this.topicLikeRepository.find({
          where: {
            community_topic: { id: topics[i].id },
          },
        });

        topics[i].likes = likes.filter(
          (i) => i.reaction_type === REACTION_TYPE.LIKE,
        ).length;

        topics[i].dislikes = likes.filter(
          (i) => i.reaction_type === REACTION_TYPE.DISLIKE,
        ).length;

        const follow = await this.topicFollowRepository.find({
          where: {
            community_topic: {
              id: topics[i].id,
            },
          },
        });

        topics[i].follow_users = follow;

        topics[i].follow = follow.filter(
          (i) => i.reaction_type === FOLLOW_REACTION_TYPE.FOLLOW,
        ).length;
        topics[i].unfollow = follow.filter(
          (i) => i.reaction_type === FOLLOW_REACTION_TYPE.UNFOLLOW,
        ).length;
        topics[i].user_like_reaction = null;
        for (let j = 0; j < likes.length; j++) {
          if (likes[j].user_id == user_id) {
            topics[i].user_like_reaction = likes[j].reaction_type;
            break;
          }
        }

        topics[i].user_follow_reaction = null;
        for (let j = 0; j < follow.length; j++) {
          if (follow[j].user_id == user_id) {
            topics[i].user_follow_reaction = follow[j].reaction_type;
            break;
          }
        }

        for (let k = 0; k < topics[i].follow_users.length; k++) {
          const user = await this.getUser(topics[i].follow_users[k].user_id);
          topics[i].follow_users[k].user_id = user;
        }

        const communityRequest: any =
          await this.communityRequestRepository.findOne({
            where: {
              request_reference_id: id,
              community_request_type: COMMUNITY_REQUEST_TYPE.TOPIC,
            },
            order: {
              id: 'DESC',
            },
            relations: ['community', 'community.community_users'],
          });
        topics[i].community_request = communityRequest;

        if (communityRequest) {
          const timeline = await this.timelineRepository.find({
            where: { community_id: communityRequest.community.id },
          });
          const resPost: any = [...timeline];

          for (let j = 0; j < resPost.length; j++) {
            // const post = await this.communityPostRepository.findOne({
            //   where: {
            //     id: resPost[j].post_id,
            //     community: {
            //       id: resPost[j].community_id,
            //     },
            //   },
            // });

            // if (post) {
            const post_count = await this.communityPostRepository.count({
              where: {
                community: {
                  id: resPost[j].community_id,
                },
              },
            });

            topics[i].post_count = post_count ? post_count : 0;
            //   }
          }
          const currUser = this.findObject(
            topics[i].community_request.community.community_users,
            user_id,
            'val',
          );
          topics[i].community_request.community.is_host =
            currUser && currUser.role === 'HOST' ? true : false;

          topics[i].community_request.community.is_moderator =
            currUser && currUser.role === 'MODERATOR' ? true : false;

          topics[i].community_request.community.is_member =
            currUser && currUser.invite_status === 'ACCEPTED' ? true : false;
        }
      }

      const topicRes: any = topic;

      const user = await this.getUser(topicRes.created_by);
      topicRes.created_by = user;
      return topicRes;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getTopicByCommunity(id: number, user_id: number): Promise<any> {
    try {
      const community_request = await this.communityRequestRepository.find({
        where: {
          community_request_type: COMMUNITY_REQUEST_TYPE.TOPIC,
          community: {
            id: id,
          },
        },
      });

      if (community_request.length) {
        const reference = await this.arrayColumn(
          community_request,
          'request_reference_id',
        );
        const topics: any = await this.communityTopicRepository.find({
          where: {
            id: In(reference),
          },
        });
        for (let i = 0; i < topics.length; i++) {
          const likes = await this.topicLikeRepository.find({
            where: {
              community_topic: { id: topics[i].id },
            },
          });
          topics[i].likes = likes.filter(
            (i) => i.reaction_type === REACTION_TYPE.LIKE,
          ).length;

          topics[i].dislikes = likes.filter(
            (i) => i.reaction_type === REACTION_TYPE.DISLIKE,
          ).length;

          const follow = await this.topicFollowRepository.find({
            where: {
              community_topic: { id: topics[i].id },
            },
          });
          topics[i].follow = follow.filter(
            (i) => i.reaction_type === FOLLOW_REACTION_TYPE.FOLLOW,
          ).length;

          topics[i].unfollow = follow.filter(
            (i) => i.reaction_type === FOLLOW_REACTION_TYPE.UNFOLLOW,
          ).length;

          topics[i].user_like_reaction = null;
          for (let j = 0; j < likes.length; j++) {
            if (likes[j].user_id == user_id) {
              topics[i].user_like_reaction = likes[j].reaction_type;
              break;
            }
          }
          topics[i].user_follow_reaction = null;
          for (let j = 0; j < follow.length; j++) {
            if (follow[j].user_id == user_id) {
              topics[i].user_follow_reaction = follow[j].reaction_type;
              break;
            }
          }
          topics[i] = topics[i];
        }
        return topics;
      } else {
        return {
          status: 500,
          message: 'No Topics Found',
        };
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async updateTopic(
    id: number,
    data: UpdateTopicDto,
  ): Promise<GetTopicDto> {
    try {
      const topic = await this.communityTopicRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!topic) {
        throw new HttpException(
          'TOPICS_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const topicRequest = await this.communityRequestRepository.findOne({
        where: {
          request_reference_id: id,
          community_request_type: COMMUNITY_REQUEST_TYPE.TOPIC,
        },
      });
      if (topicRequest) {
        if (data.reason_of_the_rejection) {
          topicRequest.reason_of_the_rejection = data.reason_of_the_rejection;
        }

        if (data.feedback) {
          topicRequest.feedback = data.feedback;
        }
        await this.communityRequestRepository.save(topicRequest);
      }
      delete data.reason_of_the_rejection;
      delete data.feedback;
      await this.communityTopicRepository.update(id, data);
      const updatedTopic = await this.communityTopicRepository.findOne({
        where: {
          id: id,
        },
      });
      return updatedTopic;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async deleteTopic(id: number): Promise<any> {
    try {
      const topic = await this.communityTopicRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!topic) {
        throw new HttpException(
          'TOPICS_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.communityTopicRepository.delete(id);
      return {
        status: 200,
        message: 'Topic deleted successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async inviteUsers(
    invites: InviteUsersToCommunityDto,
    user_id: number,
  ): Promise<any> {
    try {
      const community = await this.communityRepository.findOne({
        where: {
          id: invites.community_id,
        },
      });
      if (!community) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }
      const invitedByUser = await this.getUser(user_id);
      for (let i = 0; i < invites.users.length; i++) {
        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_email', {
            email: invites.users[i],
          }),
        );
        console.log('invites.users[i]', invites.users[i]);

        if (invitedUser.id) {
          const commUser = await this.communityUserRepository.findOne({
            where: {
              user_id: invitedUser.id,
              community: {
                id: community.id,
              },
            },
          });
          if (
            community.community_created_by != invitedUser.id &&
            community.community_type == COMMUNITY_TYPE.SECRET
          ) {
            console.log('invitedUser.id', invitedUser.id);
            return {
              status: 500,
              message: `Community is secret only host and moderator can sent invite.`,
            };
          }
          if (
            commUser &&
            commUser.invite_status == COMMUNITY_INVITE_STATUS.PENDING
          ) {
            return {
              status: 500,
              message: `You've already requested to join this community, Please wait for Host or Moderator to approve your request.`,
            };
          }
          if (
            commUser &&
            commUser.invite_status == COMMUNITY_INVITE_STATUS.ACCEPTED
          ) {
            return {
              status: 500,
              message: 'User already joined community.',
            };
          }

          if (commUser) {
            commUser.invited_by = user_id;
            commUser.invite_status = COMMUNITY_INVITE_STATUS.PENDING;
            await this.communityUserRepository.update(commUser.id, commUser);
          }

          if (!commUser) {
            const communityJoin = new CommunityUser();
            communityJoin.community = community;
            communityJoin.invited_by = user_id;
            communityJoin.role = invites.community_role;
            communityJoin.user_id = invitedUser.id;
            communityJoin.email = invites.users[i];
            if (community.community_type === COMMUNITY_TYPE.PUBLIC) {
              console.log('HOLDER PRIVATE');
              communityJoin.invite_status = COMMUNITY_INVITE_STATUS.ACCEPTED;
            } else if (community.community_type === COMMUNITY_TYPE.SECRET) {
              communityJoin.invite_status = COMMUNITY_INVITE_STATUS.ACCEPTED;
            } else if (
              community.community_type === COMMUNITY_TYPE.PRIVATE &&
              invitedUser.id == community.community_created_by
            ) {
              console.log('HOLDER PRIVATE');
              communityJoin.invite_status = COMMUNITY_INVITE_STATUS.ACCEPTED;
            } else {
              communityJoin.invite_status = COMMUNITY_INVITE_STATUS.PENDING;
            }

            await this.communityUserRepository.save(communityJoin);

            const userSetting = await this.getUserSetting(Number(user_id));
            let sentNotification = true;
            let sentMail = true;
            if (userSetting.length) {
              for (let j = 0; j < userSetting.length; j++) {
                sentNotification =
                  userSetting[j].setting.key == 'community_push_notification' &&
                  userSetting[j].setting.status == 'ACTIVE' &&
                  userSetting[j].value == 'true'
                    ? true
                    : false;
                sentMail =
                  userSetting[j].setting.key ==
                    'community_email_notification' &&
                  userSetting[j].setting.status == 'ACTIVE' &&
                  userSetting[j].value == 'true'
                    ? true
                    : false;

                if (sentNotification == true) {
                  const admin_notification = await firstValueFrom(
                    this.adminClient.send<any>(
                      'get_notification_by_type',
                      'COMMUNITY_INVITE_REQUEST',
                    ),
                  );
                  const joinRequestNotification = {
                    title: admin_notification.notification_title
                      .replace(
                        '*user*',
                        invitedByUser.general_profile.first_name,
                      )
                      .replace('*community name*', community.name),
                    content: admin_notification.notification_content
                      .replace(
                        '*user*',
                        invitedByUser.general_profile.first_name,
                      )
                      .replace('*community name*', community.name),
                    type: admin_notification.notification_type,
                    notification_from: user_id,
                    notification_to: invitedUser.id,
                    payload: communityJoin,
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
                        community_name: community.name,
                        name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                        invite_by: `${invitedByUser.general_profile.first_name} ${invitedByUser.general_profile.last_name}`,
                        invitationLink: `${this.configService.get<string>(
                          'community_join_request_url',
                        )}/${community.id}`,
                      },
                      subject: `You got invite to join ${community.name} at hubbers`,
                    },
                  };
                  this.mailClient.emit('send_email', payload);
                }
              }
            }
          }
        } else {
          const commUser = await this.communityUserRepository.findOne({
            where: {
              email: invites.users[i],
            },
          });
          if (
            commUser &&
            commUser.invite_status == COMMUNITY_INVITE_STATUS.ACCEPTED
          ) {
            return {
              status: 500,
              message: 'User already joined community.',
            };
          }

          if (commUser) {
            commUser.invited_by = user_id;
            commUser.invite_status = COMMUNITY_INVITE_STATUS.PENDING;
            await this.communityUserRepository.update(commUser.id, commUser);
          }
          if (!commUser) {
            const communityJoin = new CommunityUser();
            communityJoin.community = community;
            communityJoin.invite_status = COMMUNITY_INVITE_STATUS.PENDING;
            communityJoin.invited_by = user_id;
            communityJoin.role = invites.community_role;
            communityJoin.user_id = -1;
            communityJoin.email = invites.users[i];
            await this.communityUserRepository.save(communityJoin);
            const payload: IMailPayload = {
              template: 'INVITE_USER_TO_COMMUNITY_DYNAMIC',
              payload: {
                emails: [invites.users[i]],
                data: {
                  community_name: community.name,
                  name: invites.users[i],
                  invite_by: `${invitedByUser.general_profile.first_name} ${invitedByUser.general_profile.last_name}`,
                  invitationLink: `${this.configService.get<string>(
                    'community_join_request_url',
                  )}/${community.id}`,
                },
                subject: `You got invite to join ${community.name} at hubbers`,
              },
            };
            this.mailClient.emit('send_email', payload);
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

  public async joinInvitedCommunity(
    data: JoinInvitedCommunityDto,
  ): Promise<any> {
    try {
      const decode = await firstValueFrom(
        this.tokenClient.send('community_join_token_decode', data.token),
      );
      if (!decode) {
        throw new HttpException(
          'INVALID_INVITATION_TOKEN',
          HttpStatus.NOT_FOUND,
        );
      }

      const userInvited = await this.communityUserRepository.findOne({
        where: {
          user_id: decode.userId,
        },
      });

      if (!userInvited) {
        throw new HttpException('NO_INVITATION_FOUND', HttpStatus.NOT_FOUND);
      }

      if (userInvited.invite_status == COMMUNITY_INVITE_STATUS.ACCEPTED) {
        return {
          status: 200,
          message: 'User already joined community',
        };
      }

      userInvited.invite_status = COMMUNITY_INVITE_STATUS.ACCEPTED;

      // Send email to the community host about accept

      await this.communityUserRepository.update(userInvited.id, userInvited);

      return {
        status: 200,
        message: 'Joined community successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getInvitationLink(
    community_id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const community = await this.communityRepository.findOne({
        where: {
          id: community_id,
          community_created_by: user_id,
        },
      });

      return {
        message: `${this.configService.get<string>('join_community_url')}/${
          community.invitation_code
        }`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async joinedUserCommunity(id: number): Promise<ICommunity[] | any> {
    try {
      const where =
        id > 0
          ? { user_id: id, invite_status: COMMUNITY_INVITE_STATUS.ACCEPTED }
          : {
              invite_status: COMMUNITY_INVITE_STATUS.ACCEPTED,
            };
      const communityUser: any = await this.communityUserRepository.find({
        where: where,
        relations: ['community'],
      });

      if (!communityUser.length) {
        return {
          status: 200,
          message: 'No community for this user found',
        };
      }
      for (let i = 0; i < communityUser.length; i++) {
        const count = await this.communityUserRepository.count({
          where: {
            community: { id: communityUser[i].community.id },
            invite_status: COMMUNITY_INVITE_STATUS.ACCEPTED,
          },
        });
        communityUser[i].community.member_count = count;
      }
      return communityUser;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getCommunityByStatus(status): Promise<ICommunity[] | any> {
    try {
      const community = await this.communityRepository.find({
        where: {
          status: status.status,
        },
      });
      if (!community) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }

      const communitiesRes: any = [...community];
      for (let i = 0; i < communitiesRes.length; i++) {
        if (communitiesRes[i].country) {
          communitiesRes[i].country = await firstValueFrom(
            this.adminClient.send<any>(
              'get_country_by_id',
              communitiesRes[i].country,
            ),
          );
        }

        if (communitiesRes[i].language) {
          communitiesRes[i].language = await firstValueFrom(
            this.adminClient.send<any>('get_language_by_id', {
              id: communitiesRes[i].language,
            }),
          );
        }
      }

      if (communitiesRes.length > 0) {
        return communitiesRes;
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

  public async joinedUserStatus(
    status: StatusCommunityMemberDto,
  ): Promise<any> {
    try {
      const condition: any = {
        where: {
          community: {
            id: status.id,
          },
        },
        relations: ['community'],
      };

      if (status.status !== 'ALL') {
        condition.where = {
          ...condition.where,
          invite_status: status.status,
        };
      }
      const communityMember =
        await this.communityUserRepository.find(condition);
      if (!communityMember) {
        throw new HttpException(
          'COMMUNITY_USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const membersRes: any = [...communityMember];

      for (let i = 0; i < membersRes.length; i++) {
        if (membersRes[i].user_id) {
          membersRes[i].user = await this.getUser(membersRes[i].user_id);
        }
        if (membersRes[i].invited_by > 0) {
          membersRes[i].invited_by = await this.getUser(
            membersRes[i].invited_by,
          );
        }
      }

      if (membersRes.length > 0) {
        return membersRes;
      } else {
        return {
          status: 200,
          message: 'No community user found',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async communityAllow(data: AllowCommunityDto): Promise<any> {
    try {
      const communityMember = await this.communityUserRepository.findOne({
        where: {
          community: {
            id: data.community_id,
          },
          user_id: data.user_id,
        },
      });

      if (!communityMember) {
        throw new HttpException(
          'COMMUNITY_USER_REQUEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      communityMember.invite_status = data.status;

      await this.communityUserRepository.update(
        communityMember.id,
        communityMember,
      );

      return {
        status: 200,
        message: `You have successfully ${data.status.toLowerCase()} the user`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async communityMemberSearch(
    data: SearchCommunityUserDto,
  ): Promise<any> {
    try {
      const usersData = await this.getCommunityMembers(data.id);
      const users = usersData.all_members ? usersData.all_members : [];
      if (!users || users.length === 0) {
        throw new HttpException('NO_USER_FOUND', HttpStatus.NOT_FOUND);
      }
      let searchResult = [];
      if (data.search && data.search !== '') {
        searchResult = users.filter((el: any) => {
          if (
            el.user_id &&
            el.user_id.id &&
            el.user_id.general_profile &&
            el.user_id.general_profile.id
          ) {
            const full_name =
              `${el.user_id.general_profile.first_name} ${el.user_id.general_profile.last_name}`.toLowerCase();
            return full_name.includes(data.search.toLowerCase());
          }
        });
      }
      if (!searchResult || searchResult.length === 0) {
        throw new HttpException('NO_USER_FOUND', HttpStatus.NOT_FOUND);
      }
      return searchResult;
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

  public async assignTopic(data: AssignTopicDto) {
    const community: any = await this.communityRepository.findOne({
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

    const topics = [];
    if (data.topic_id.length > 0) {
      for (let i = 0; i < data.topic_id.length; i++) {
        const topic = await this.communityTopicRepository.findOne({
          where: {
            id: data.topic_id[i],
          },
        });
        if (!topic) {
          throw new HttpException(
            'COMMUNITY_TOPIC_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        topics.push(topic);
      }
    }
    for (let i = 0; i < topics.length; i++) {
      if (community) {
        const communityRequest = new CommunityRequest();
        communityRequest.community = community;
        communityRequest.created_by = 0;
        communityRequest.community_request_status =
          COMMUNITY_REQUEST_STATUS.ACCEPTED;
        communityRequest.community_request_type = COMMUNITY_REQUEST_TYPE.TOPIC;
        communityRequest.request_reference_id = topics[i].id;
        await this.communityRequestRepository.save(communityRequest);
      }
    }
    return {
      status: 200,
      message: 'Topic assigned successfully ',
    };
  }

  public async createTopicAssign(data: CreateTopicAssignDto, user_id: number) {
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

    const createTopic = new CommunityTopic();

    createTopic.name = data.name;
    createTopic.display_name = data.display_name;
    createTopic.description = data.description;
    createTopic.created_by = user_id;
    createTopic.topic_type = TOPIC_TYPE.PRIVATE;
    const community_topic =
      await this.communityTopicRepository.save(createTopic);
    await this.assignTopic({
      community_id: data.community_id,
      topic_id: [community_topic.id],
    });
    return community_topic;
  }

  public async getAdminTopicByStatus(status: TOPIC_STATUS): Promise<any> {
    try {
      const where = status != 'ALL' ? { status: status } : '';
      const topics = await this.communityTopicRepository.find({
        where: { ...where },
      });

      if (!topics) {
        throw new HttpException(
          'TOPICS_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const topicRes: any = [...topics];
      for (let i = 0; i < topicRes.length; i++) {
        const user = await this.getUser(topicRes[i].created_by);
        topicRes[i].created_by = user;
      }
      return topics;
    } catch (err) {
      console.log('err -->', err);
      throw new InternalServerErrorException(err);
    }
  }

  public async leaveCommunity(data: LeaveCommunityDto, user_id: number) {
    const community = await this.getSingleCommunity(data.id, user_id);
    if (community.statusCode && community.statusCode == 500) {
      return community;
    }
    const user = this.findObject(community.community_users, user_id, '');
    if (!user) {
      return {
        status: 500,
        message: 'No user found in community.',
      };
    }
    const leaveCommunity = new LeaveCommunity();
    leaveCommunity.community_id = data.id;
    leaveCommunity.user_id = user_id;
    leaveCommunity.reason = data.reason;
    leaveCommunity.removed_by = user_id;
    await this.leaveCommunityRepository.save(leaveCommunity);
    await this.communityUserRepository.delete(user.id);
    return {
      status: 200,
      message: 'Community leave successfully.',
    };
  }

  public async reportCommunity(data: ReportCommunityDto, user_id: number) {
    const community = await this.getSingleCommunity(data.id, user_id);
    if (community.statusCode && community.statusCode == 500) {
      return {
        statusCode: 500,
        message: 'No community found',
      };
    }
    const user = this.findObject(community.community_users, user_id, '');
    if (!user) {
      return {
        status: 500,
        message: 'No user found in community.',
      };
    }
    const communityReport = new CommunityReport();
    communityReport.community = community;
    communityReport.user_id = user_id;
    communityReport.reason = data.reason;
    await this.communityReportRepository.save(communityReport);
    return {
      status: 200,
      message: 'Community reported successfully.',
    };
  }

  public async removeCommunityMember(
    data: RemoveCommunityMemberDto,
    user_id: number,
  ) {
    const community = await this.getSingleCommunity(data.community_id, user_id);
    const removeId = data.id;
    for (let i = 0; i < removeId.length; i++) {
      const user = this.findObject(community.community_users, removeId[i], '');
      if (!user) {
        return {
          status: 500,
          message: 'No user found in community.',
        };
      }
      const leaveCommunity = new LeaveCommunity();
      leaveCommunity.community_id = data.community_id;
      leaveCommunity.user_id = removeId[i];
      leaveCommunity.reason = data.reason;
      leaveCommunity.removed_by = user_id;
      await this.leaveCommunityRepository.save(leaveCommunity);
      await this.communityUserRepository.delete(user.id);
      const userSetting = await this.getUserSetting(removeId[i]);
      let sentNotification = true;
      if (userSetting.length) {
        for (let j = 0; j < userSetting.length; j++) {
          sentNotification =
            userSetting[j].setting.key == 'community_push_notification' &&
            userSetting[j].setting.status == 'ACTIVE' &&
            userSetting[j].value == 'true'
              ? true
              : false;

          if (sentNotification == true) {
            const joinRequestNotification = {
              notification_from: user_id,
              notification_to: user.id,
              payload: community,
              content: "You've removed from community.",
              type: 'REMOVE_REQUEST',
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
    }
    return {
      message: 'User removed from community.',
    };
  }

  public async getCommunityMaxRange(
    data: CommunityMaxRangeDto,
  ): Promise<ICommunity[] | any> {
    try {
      const community = await this.communityRepository.query(
        `select * , ( point(latitude::float, longitude::float) <-> point(${data.latitude}, ${data.longitude}) )*111.325 AS distance from community order by distance `,
      );
      if (!community || community.length <= 0) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }
      if (community.length > 0) {
        const communitiesRes = [...community];
        for (let i = 0; i < communitiesRes.length; i++) {
          if (communitiesRes[i].country) {
            try {
              communitiesRes[i].country = await firstValueFrom(
                this.adminClient.send<any>(
                  'get_country_by_id',
                  communitiesRes[i].country,
                ),
              );
            } catch (err) {
              console.log('Country err -->', err);
            }
          }

          if (communitiesRes[i].community_created_by) {
            try {
              const user = await this.getUser(
                Number(communitiesRes[i].community_created_by),
              );
              communitiesRes[i].community_created_by = user;
            } catch (error) {
              console.log('community_created_by err -->', error);
            }
          }

          if (communitiesRes[i].language) {
            try {
              communitiesRes[i].language = await firstValueFrom(
                this.adminClient.send<any>('get_language_by_id', {
                  id: communitiesRes[i].language,
                }),
              );
            } catch (error) {
              console.log('language err -->', error);
            }
          }
          // communitiesRes[i].users_joined =
          //   communitiesRes[i].community_users.length;

          // if (user_id > 0) {
          //   for (let j = 0; j < communitiesRes[i].community_users.length; j++) {
          //     communitiesRes[i].is_host = this.findObject(
          //       communitiesRes[i].community_users,
          //       user_id,
          //       'bool',
          //     );
          //   }
          // }

          // if (user_id > 0) {
          //   communitiesRes[i].is_member = this.findObject(
          //     communitiesRes[i].community_users,
          //     user_id,
          //     'bool',
          //   );
          // }
        }

        return communitiesRes || [];
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
  public async getCommunityHost(): Promise<any> {
    try {
      const host = await this.communityUserRepository.find({
        where: {
          role: COMMUNITY_USER_ROLE.HOST,
        },
        relations: ['community'],
      });
      if (!host) {
        throw new HttpException(
          'COMMUNITY_USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const memberRes: any = host;
      for (let i = 0; i < host.length; i++) {
        const user = await this.getUser(Number(host[i].user_id));

        const count = await this.communityUserRepository.count({
          where: {
            community: {
              id: host[i].community.id,
            },
          },
        });
        delete memberRes.user_id;
        memberRes[i].user = user;
        memberRes[i].member_count = count;
      }
      return memberRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getTrendingTopics(user_id: number): Promise<any> {
    try {
      const community = await this.communityRepository.query(
        `SELECT * FROM community_with_topic`,
      );

      const group = await this.communityRepository.query(
        `SELECT * FROM community_group_with_topic`,
      );
      const post = await this.communityRepository.query(
        `SELECT * FROM post_topics`,
      );
      const article = await this.communityRepository.query(
        `SELECT * FROM article_topics`,
      );
      const location = await this.communityRepository.query(
        `SELECT * FROM location_post_topics`,
      );
      const poll = await this.communityRepository.query(
        `SELECT * FROM poll_post_topics`,
      );
      const mainArray = [
        ...community,
        ...group,
        ...post,
        ...poll,
        ...location,
        ...article,
      ];
      const final_array: any = [];
      for (let i = 0; i < mainArray.length; i++) {
        const element: any = Object.values(mainArray[i]);
        const topic_id: any = element[0];
        if (typeof final_array[`topic_` + topic_id] != 'number') {
          final_array[`topic_` + topic_id] = 0;
        }
        final_array[`topic_` + topic_id] = final_array[`topic_` + topic_id] + 1;
      }
      const reverse = final_array.reverse();
      let count = 1;
      const responseArr = [];
      for (const key in reverse) {
        const findTopicKey = key.split('_')[1];
        const topics_for_push = await this.getTopic(parseInt(findTopicKey), 0);
        responseArr.push(topics_for_push);
        count++;
        if (count == 10 || count > 10) {
          break;
        }
      }
      const topics: any = [...responseArr];
      for (let i = 0; i < topics.length; i++) {
        const likes = await this.topicLikeRepository.find({
          where: {
            community_topic: { id: topics[i].id },
          },
        });
        topics[i].likes = likes.filter(
          (i) => i.reaction_type === REACTION_TYPE.LIKE,
        ).length;

        topics[i].dislikes = likes.filter(
          (i) => i.reaction_type === REACTION_TYPE.DISLIKE,
        ).length;

        const follow = await this.topicFollowRepository.find({
          where: {
            community_topic: { id: topics[i].id },
          },
        });
        topics[i].follow = follow.filter(
          (i) => i.reaction_type === FOLLOW_REACTION_TYPE.FOLLOW,
        ).length;

        topics[i].unfollow = follow.filter(
          (i) => i.reaction_type === FOLLOW_REACTION_TYPE.UNFOLLOW,
        ).length;

        topics[i].user_like_reaction = null;
        for (let j = 0; j < likes.length; j++) {
          if (likes[j].user_id == user_id) {
            topics[i].user_like_reaction = likes[j].reaction_type;
            break;
          }
        }
        topics[i].user_follow_reaction = null;
        for (let j = 0; j < follow.length; j++) {
          if (follow[j].user_id == user_id) {
            topics[i].user_follow_reaction = follow[j].reaction_type;
            break;
          }
        }
      }
      return topics || [];
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async topicReaction(
    id: number,
    data: TopicReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const communityTopic = await this.communityTopicRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!communityTopic) {
        throw new HttpException(
          'COMMUNITY_TOPIC_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.topicLikeRepository.findOne({
        where: {
          community_topic: {
            id: communityTopic.id,
          },
          user_id: user_id,
        },
      });

      if (getReaction) {
        await this.topicLikeRepository.update(
          {
            community_topic: {
              id: communityTopic.id,
            },
            user_id: user_id,
          },
          data,
        );
      }

      if (
        (data.reaction_type === REACTION_TYPE.LIKE && !getReaction) ||
        (data.reaction_type === REACTION_TYPE.DISLIKE && !getReaction)
      ) {
        const reaction = new TopicLike();
        reaction.community_topic = communityTopic;
        reaction.topic_type = communityTopic.topic_type;
        reaction.community_topic = communityTopic;
        reaction.user_id = user_id;
        reaction.reaction_type = data.reaction_type;

        await this.topicLikeRepository.save(reaction);
      }
      return {
        status: 200,
        message: `${data.reaction_type} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTopicByReaction(
    reaction: TopicReactionDto,
  ): Promise<ICommunity[] | any> {
    try {
      const communityTopic = await this.topicLikeRepository.find({
        where: {
          reaction_type: reaction.reaction_type,
        },
        relations: ['community_topic'],
      });
      if (!communityTopic) {
        throw new HttpException(
          'COMMUNITY_TOPIC_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const topicsRes: any = [...communityTopic];
      for (let i = 0; i < topicsRes.length; i++) {
        topicsRes[i].user_id = await this.getUser(topicsRes[i].user_id);
      }
      return topicsRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  public async topicFollowReaction(
    id: number,
    data: TopicFollowReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const communityTopic = await this.communityTopicRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!communityTopic) {
        throw new HttpException(
          'COMMUNITY_TOPIC_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.topicFollowRepository.findOne({
        where: {
          community_topic: {
            id: communityTopic.id,
          },
          user_id: user_id,
        },
      });

      if (getReaction) {
        await this.topicFollowRepository.update(
          {
            community_topic: {
              id: communityTopic.id,
            },
            user_id: user_id,
          },
          data,
        );
      }

      if (
        (data.reaction_type === FOLLOW_REACTION_TYPE.FOLLOW && !getReaction) ||
        (data.reaction_type === FOLLOW_REACTION_TYPE.UNFOLLOW && !getReaction)
      ) {
        const reaction = new TopicFollow();
        reaction.community_topic = communityTopic;
        reaction.topic_type = communityTopic.topic_type;
        reaction.community_topic = communityTopic;
        reaction.user_id = user_id;
        reaction.reaction_type = data.reaction_type;

        await this.topicFollowRepository.save(reaction);
      }
      return {
        status: 200,
        message: `${data.reaction_type} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTopicByFollowReaction(
    reaction: TopicFollowReactionDto,
  ): Promise<ICommunity[] | any> {
    try {
      const communityTopic = await this.topicFollowRepository.find({
        where: {
          reaction_type: reaction.reaction_type,
        },
        relations: ['community_topic'],
      });
      if (!communityTopic) {
        throw new HttpException(
          'COMMUNITY_TOPIC_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const topicsRes: any = [...communityTopic];
      for (let i = 0; i < topicsRes.length; i++) {
        topicsRes[i].user_id = await this.getUser(topicsRes[i].user_id);
      }
      return topicsRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getAllFollowTopics(
    data: any,
    reaction_type: FOLLOW_REACTION_TYPE,
  ): Promise<any> {
    try {
      const communityTopic = await this.topicFollowRepository.findOne({
        where: {
          id: data.id,
          reaction_type: reaction_type,
        },
      });

      const topics = await this.topicFollowRepository.find({
        order: {
          id: 'DESC',
        },
        where: {
          community_topic: { id: communityTopic.id },
        },
        take: data.take,
        skip: data.skip,
      });
      if (!topics) {
        throw new HttpException(
          'TOPICS_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const topicRes: any = [...topics];

      for (let i = 0; i < topicRes.length; i++) {
        const user = await this.getUser(topicRes[i].user_id);
        topicRes[i].created_by = user;
      }
      return topics;
    } catch (err) {
      console.log('err -->', err);
      throw new InternalServerErrorException(err);
    }
  }

  public async getTopicsLikes(
    topic_id: number,
    data: any,
    reaction_type: REACTION_TYPE,
  ): Promise<any> {
    try {
      const communityTopic = await this.communityTopicRepository.findOne({
        where: {
          id: topic_id,
        },
      });
      if (!communityTopic) {
        throw new HttpException(
          'COMMUNITY_TOPIC_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const topicLikes = await this.topicLikeRepository.find({
        where: {
          community_topic: {
            id: communityTopic.id,
          },
          reaction_type: reaction_type,
        },
        take: data.take,
        skip: data.skip,
      });
      if (!topicLikes.length) {
        return {
          statusCode: 500,
          message: 'No topic reaction found.',
        };
      }
      for (let i = 0; i < topicLikes.length; i++) {
        topicLikes[i].user_id = await this.getUser(topicLikes[i].user_id);
      }
      return topicLikes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async inviteMember(
    invites: any,
    user_id: number,
    status = false,
  ): Promise<any> {
    try {
      const community = await this.communityRepository.findOne({
        where: {
          id: invites.community_id,
        },
      });
      if (!community) {
        return {
          statusCode: 500,
          message: 'Community not found',
        };
      }
      if (invites.users.length > 0) {
        for (let i = 0; i < invites.users.length; i++) {
          const invitedUser = await firstValueFrom(
            this.userClient.send('get_user_by_email', {
              email: invites.users[i],
            }),
          );

          if (invitedUser.id) {
            const commUser = await this.communityUserRepository.findOne({
              where: {
                user_id: invitedUser.id,
                community: {
                  id: community.id,
                },
              },
            });
            if (
              commUser &&
              commUser.invite_status == COMMUNITY_INVITE_STATUS.PENDING
            ) {
              return {
                status: 500,
                message: `You've already requested to join this community, Please wait for Host or Moderator to approve your request.`,
              };
            }
            if (
              commUser &&
              commUser.invite_status == COMMUNITY_INVITE_STATUS.ACCEPTED
            ) {
              return {
                status: 500,
                message: 'User already joined community.',
              };
            }

            if (commUser) {
              commUser.invited_by = user_id;
              commUser.invite_status = COMMUNITY_INVITE_STATUS.PENDING;
              await this.communityUserRepository.update(commUser.id, commUser);
            }

            if (!commUser) {
              const communityJoin = new CommunityUser();
              communityJoin.community = community;
              communityJoin.invite_status =
                status == true
                  ? COMMUNITY_INVITE_STATUS.ACCEPTED
                  : COMMUNITY_INVITE_STATUS.PENDING;
              communityJoin.invited_by = user_id;
              communityJoin.role = invites.community_role;
              communityJoin.user_id = invitedUser.id;
              communityJoin.email = invites.users[i];

              await this.communityUserRepository.save(communityJoin);
            }
          } else {
            return {
              status: 500,
              message:
                'please send user email instead of user Id in user field',
            };
          }
        }
      } else {
        return {
          status: 500,
          message: 'please send user email in users field',
        };
      }
      return {
        status: 200,
        message: 'Invite sent successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCommunityMember(id: number, data: any): Promise<any> {
    try {
      const communityMember = await this.communityUserRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!communityMember) {
        return {
          statusCode: 500,
          message: 'Community Member not found',
        };
      }
      if (data.community_id) {
        const community = await this.communityRepository.findOne({
          where: {
            id: data.community_id,
          },
        });
        if (!community) {
          return {
            statusCode: 500,
            message: 'Community not found',
          };
        }
        communityMember.community = community;
      }
      if (data.users.length) {
        for (let i = 0; i < data.users.length; i++) {
          const invitedUser = await firstValueFrom(
            this.userClient.send('get_user_by_email', {
              email: data.users[i],
            }),
          );
          communityMember.user_id = invitedUser.id;
          communityMember.email = data.users[i];
        }
        if (data.invite_status) {
          communityMember.invite_status = data.invite_status;
        }
        if (data.community_role) {
          communityMember.role = data.community_role;
        }
      }
      await this.communityUserRepository.save(communityMember);

      return {
        status: 200,
        message: 'Community Member Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
