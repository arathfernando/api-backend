import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  COMMUNITY_REQUEST_STATUS,
  COMMUNITY_REQUEST_TYPE,
  FOLLOW_REACTION_TYPE,
  GROUP_INVITE_STATUS,
  GROUP_PRIVACY,
  GROUP_STATUS,
  GROUP_TYPE,
  GROUP_USER_ROLE,
  REACTION_TYPE,
  TOPIC_STATUS,
} from 'src/core/constant/enum.constant';
import { AllowGroupDto } from 'src/core/dtos/community-group/allow-in-group.dto';
import { StatusGroupMemberDto } from 'src/core/dtos/community-group/group-member-status.dto';
import { GroupTypeDto } from 'src/core/dtos/community-group/group-type.dto';
import { SearchDataDto } from 'src/core/dtos/community-group/search-data.dto';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { IMailPayload } from 'src/core/interfaces';
import { ICommunityGroup } from 'src/core/interfaces/ICommunityGroup';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  CommunityGroup,
  CommunityTopic,
  GroupReport,
  GroupUsers,
  LeaveGroup,
  GroupActivity,
  Community,
  TopicLike,
  TopicFollow,
} from 'src/database/entities';
import { SearchDataQueryGroupDto } from 'src/core/dtos/community-group/search-data-query.dto';
import { JoinInvitedGroupDto } from 'src/core/dtos/community-group/join-invited-group.dto';
import { generateRandomNumber } from 'src/core/helper/random-number.helper';
import { InviteUsersToGroupDto } from 'src/core/dtos/community-group/invite-users.dto';
import { ReportGroupDto } from 'src/core/dtos/community-group/report-group.dto';
import { LeaveGroupDto } from 'src/core/dtos/community-group/leave-group.dto';
import { RemoveGroupMemberDto } from 'src/core/dtos/community-group/remove-group-member.dto';
import { In, Not, Repository } from 'typeorm';
import { CommunityRequest } from 'src/database/entities/community-request.entity';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommunityGroupService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('TOKEN_SERVICE') private readonly tokenClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityGroup)
    private readonly communityGroupRepository: Repository<CommunityGroup>,
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
    @InjectRepository(LeaveGroup)
    private readonly leaveGroupRepository: Repository<LeaveGroup>,
    @InjectRepository(GroupReport)
    private readonly groupReportRepository: Repository<GroupReport>,
    @InjectRepository(GroupActivity)
    private readonly groupActivityRepository: Repository<GroupActivity>,
    @InjectRepository(GroupUsers)
    private readonly groupUserRepository: Repository<GroupUsers>,
    @InjectRepository(CommunityRequest)
    private readonly communityRequestRepository: Repository<CommunityRequest>,
    @InjectRepository(TopicLike)
    private readonly topicLikeRepository: Repository<TopicLike>,
    @InjectRepository(TopicFollow)
    private readonly topicFollowRepository: Repository<TopicFollow>,

    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    this.userClient.connect();
    this.mailClient.connect();
    this.tokenClient.connect();
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

  async createGroup(
    data: any,
    file: any,
    user_id: number,
  ): Promise<ICommunityGroup> {
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
      if (typeof file != 'string' && file) {
        cover_img = await this.s3Service.uploadFile(file);
      }

      const group = new CommunityGroup();
      group.group_name = data.group_name;
      group.description = data.description;
      group.privacy = data.privacy;
      group.group_type = data.group_type;
      group.status =
        data.group_type == GROUP_TYPE.GLOBAL
          ? GROUP_STATUS.PENDING
          : GROUP_STATUS.ACCEPTED;
      group.cover_page =
        cover_img && cover_img.Location
          ? cover_img.Location
          : typeof data.cover_img === 'string'
          ? data.cover_img
          : null;

      const communityTopicsArr: CommunityTopic[] = [];

      if (data.topics && data.topics !== '') {
        const topicsArr = data.topics.split(',');

        for (let i = 0; i < topicsArr.length; i++) {
          const topic = await this.communityTopicRepository.findOne({
            where: {
              id: topicsArr[i],
            },
          });
          communityTopicsArr.push(topic);
        }
      }
      group.topics = communityTopicsArr;

      group.created_by = user_id;
      group.invitation_code = await generateRandomNumber(7, true);

      const groupCreated = await this.communityGroupRepository.save(group);
      if (!data.invited_members || data.invited_members == '') {
        const gu = new GroupUsers();
        gu.group = groupCreated;
        gu.user_id = user_id;
        gu.invite_status = GROUP_INVITE_STATUS.ACCEPTED;
        gu.invited_by = null;
        gu.role = GROUP_USER_ROLE.ADMIN;

        await this.groupUserRepository.save(gu);
        if (community) {
          const communityRequest = new CommunityRequest();
          communityRequest.community = community;
          communityRequest.created_by = user_id;
          communityRequest.community_request_status =
            COMMUNITY_REQUEST_STATUS.PENDING;
          communityRequest.community_request_type =
            COMMUNITY_REQUEST_TYPE.GROUP;
          communityRequest.request_reference_id = group.id;
          await this.communityRequestRepository.save(communityRequest);
        }
      } else if (data.invited_members && data.invited_members != '') {
        const invitedMembers = data.invited_members.split(',');

        for (let i = 0; i < invitedMembers.length; i++) {
          const gu = new GroupUsers();
          gu.group = groupCreated;
          gu.user_id = Number(invitedMembers[i]);
          gu.invite_status = GROUP_INVITE_STATUS.ACCEPTED;
          gu.invited_by = user_id;
          gu.role = GROUP_USER_ROLE.MEMBER;
          await this.groupUserRepository.save(gu);
          if (community) {
            const communityRequest = new CommunityRequest();
            communityRequest.community = community;
            communityRequest.created_by = user_id;
            communityRequest.community_request_status =
              COMMUNITY_REQUEST_STATUS.PENDING;
            communityRequest.community_request_type =
              COMMUNITY_REQUEST_TYPE.GROUP;
            communityRequest.request_reference_id = group.id;
            await this.communityRequestRepository.save(communityRequest);
          }

          const invitedUser = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(invitedMembers[i]),
            }),
          );

          const createTokenResponse = await firstValueFrom(
            this.tokenClient.send(
              'community_join_token_create',
              JSON.stringify(invitedUser),
            ),
          );
          const userSetting = await this.getUserSetting(invitedMembers[i]);
          let sentMail = true;
          if (userSetting.length) {
            for (let j = 0; j < userSetting.length; j++) {
              sentMail =
                userSetting[j].setting.key == 'group_email_notification' &&
                userSetting[j].setting.status == 'ACTIVE' &&
                userSetting[j].setting.value == true
                  ? true
                  : false;

              if (sentMail == true) {
                const payload: IMailPayload = {
                  template: 'INVITE_USER_TO_GROUP',
                  payload: {
                    emails: [invitedUser.email],
                    data: {
                      group_name: group.group_name,
                      name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                      invite_by: ``,
                      invitationLink: `${this.configService.get<string>(
                        'join_group_url',
                      )}/${groupCreated.id}/${
                        createTokenResponse.verificationToken
                      }`,
                    },
                    subject: `You got invite to join ${group.group_name} at hubbers`,
                  },
                };
                this.mailClient.emit('send_email', payload);
              }
            }
          }
        }
      }

      return group;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateGroup(
    id: GetByIdDto,
    data: any,
    file: any,
    user_id: number,
  ): Promise<ICommunityGroup> {
    try {
      const group = await this.communityGroupRepository.findOne({
        where: {
          id: id.id,
          created_by: user_id,
        },
      });

      if (!group) {
        throw new HttpException(
          'GROUP_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let cover;
      if (file) {
        cover = await this.s3Service.uploadFile(file);
        data.cover_page = cover.Location;
      }

      const communityTopicsArr: CommunityTopic[] = [];
      if (data.topics && data.topics !== '') {
        const topicsArr = data.topics.split(',');

        for (let i = 0; i < topicsArr.length; i++) {
          const topic = await this.communityTopicRepository.findOne({
            where: {
              id: topicsArr[i],
            },
          });
          communityTopicsArr.push(topic);
        }
      }

      const topicRequest = await this.communityRequestRepository.findOne({
        where: {
          request_reference_id: id.id,
          community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
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

      if (data.invited_members && data.invited_members != '') {
        const invitedMembers = data.invited_members.split(',');

        for (let i = 0; i < invitedMembers.length; i++) {
          const gu = await this.groupUserRepository.findOne({
            where: {
              id: invitedMembers[i],
            },
          });

          if (!gu) {
            const g_user = new GroupUsers();

            g_user.group = group;
            g_user.user_id = Number(invitedMembers[i]);
            g_user.invite_status = GROUP_INVITE_STATUS.PENDING;
            g_user.invited_by = user_id;
            g_user.role = GROUP_USER_ROLE.MEMBER;
            await this.groupUserRepository.save(g_user);

            const invitedUser = await firstValueFrom(
              this.userClient.send<any>('get_user_by_id', {
                userId: Number(invitedMembers[i]),
              }),
            );

            const createTokenResponse = await firstValueFrom(
              this.tokenClient.send(
                'community_join_token_create',
                JSON.stringify(invitedUser),
              ),
            );
            const userSetting = await this.getUserSetting(invitedMembers[i]);
            let sentMail = true;
            if (userSetting.length) {
              for (let j = 0; j < userSetting.length; j++) {
                sentMail =
                  userSetting[j].setting.key == 'group_email_notification' &&
                  userSetting[j].setting.status == 'ACTIVE' &&
                  userSetting[j].setting.value == true
                    ? true
                    : false;
                if (sentMail == true) {
                  const payload: IMailPayload = {
                    template: 'INVITE_USER_TO_GROUP',
                    payload: {
                      emails: [invitedUser.email],
                      data: {
                        group_name: group.group_name,
                        name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                        invite_by: ``,
                        invitationLink: `${this.configService.get<string>(
                          'join_group_url',
                        )}/${group.id}/${
                          createTokenResponse.verificationToken
                        }`,
                      },
                      subject: `You got invite to join ${group.group_name} at hubbers`,
                    },
                  };
                  this.mailClient.emit('send_email', payload);
                }
              }
            }
          }
        }
      }

      delete data.invited_members;
      group.topics = communityTopicsArr;
      delete data.reason_of_the_rejection;
      delete data.feedback;
      // delete data.topics;
      await this.communityGroupRepository.update(id, data);

      const groupData = await this.communityGroupRepository.findOne({
        where: {
          id: id.id,
          created_by: user_id,
        },
      });
      return groupData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGroups(
    queryParam: SearchDataQueryGroupDto,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = queryParam.limit * queryParam.page - queryParam.limit;
      const whereQuery = user_id != 0 ? 'group.status = :status' : '';

      const whereQueryData =
        user_id != 0
          ? {
              status: GROUP_STATUS.ACCEPTED,
              // invite_status: GROUP_INVITE_STATUS.ACCEPTED,
            }
          : {};

      const groupsQuery = this.communityGroupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.topics', 'topics')
        .leftJoinAndSelect('group.group_users', 'group_users')
        .leftJoinAndSelect('group.group_rules', 'group_rules')
        .where(whereQuery, whereQueryData)
        .orderBy('group.id', 'DESC')
        .take(queryParam.limit)
        .skip(skip);
      if (queryParam.search) {
        groupsQuery.andWhere('LOWER(group.group_name) LIKE LOWER(:data)', {
          data: `%${queryParam.search}%`,
        });
      }
      if (queryParam.group_type) {
        groupsQuery.andWhere('group.group_type = :group_type', {
          group_type: `${queryParam.group_type}`,
        });
      }
      if (queryParam.community_id) {
        const community = await this.communityRequestRepository.find({
          where: {
            community: {
              id: parseInt(queryParam.community_id),
            },
            community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
          },
        });
        if (community.length > 0) {
          const groupIds = await this.arrayColumn(
            community,
            'request_reference_id',
          );

          groupsQuery.andWhere(`group.id IN (${groupIds.join(', ')})`);
        } else {
          groupsQuery.andWhere('group.id IN (:community_id)', {
            community_id: `${queryParam.community_id}`,
          });
        }
      }

      const groups = await groupsQuery.getMany();
      const groupsRes: any = [...groups];

      for (let i = 0; i < groupsRes.length; i++) {
        if (groupsRes) {
          const reqCommunity = await this.communityRequestRepository.findOne({
            where: {
              request_reference_id: groupsRes[i].id,
              community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
            },
            relations: ['community'],
          });
          groupsRes[i].community_request = reqCommunity ? reqCommunity : {};
        }
        if (user_id != 0) {
          const group_users = [];
          for (let j = 0; j < groupsRes[i].group_users.length; j++) {
            const element = groupsRes[i].group_users[j];
            if (
              element &&
              element.invite_status != GROUP_INVITE_STATUS.REJECTED
            ) {
              group_users.push(element);
            }
          }
          groupsRes[i].group_users = group_users ? group_users : [];
        }
        if (groupsRes[i].created_by) {
          const invitedUser = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(groupsRes[i].created_by),
            }),
          );

          delete invitedUser.password;
          delete invitedUser.verification_code;
          delete invitedUser.reset_password_otp;
          groupsRes[i].created_by = invitedUser;
        }
        if (user_id > 0) {
          for (let j = 0; j < groupsRes[i].group_users.length; j++) {
            const currUser = this.findObject(
              groupsRes[i].group_users,
              user_id,
              'DESC',
            );
            groupsRes[i].is_moderator =
              currUser && currUser.role === 'MODERATOR' ? true : false;
            groupsRes[i].is_rejected =
              currUser &&
              currUser.invite_status === 'REJECTED' &&
              currUser.user_id == user_id
                ? true
                : false;
            groupsRes[i].is_requested =
              currUser &&
              currUser.invite_status === 'PENDING' &&
              currUser.user_id == user_id
                ? true
                : false;
            groupsRes[i].is_member =
              currUser &&
              currUser.invite_status === 'ACCEPTED' &&
              currUser.user_id == user_id
                ? true
                : false;
            if (groupsRes[i].created_by.id == user_id) {
              groupsRes[i].is_host = true;
            } else {
              groupsRes[i].is_host = false;
            }
          }
        }
      }
      const total = await this.communityGroupRepository.count({
        where: { ...whereQueryData },
      });
      const totalPages = Math.ceil(total / queryParam.limit);
      groupsRes.count = total;
      const where =
        user_id == 0
          ? {}
          : {
              created_by: user_id,
              status: GROUP_STATUS.ACCEPTED,
            };

      const your_group: any = await this.communityGroupRepository.find({
        where: { ...where },
        relations: ['topics', 'group_users', 'group_rules'],
      });

      const community_ids = [];
      const your_group_id = [];

      for (let i = 0; i < your_group.length; i++) {
        const reqCommunity = await this.communityRequestRepository.findOne({
          where: {
            request_reference_id: your_group[i].id,
            community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
          },
          relations: ['community'],
        });
        your_group[i].community_request = reqCommunity ? reqCommunity : {};
        const community_group = await this.communityRequestRepository.findOne({
          where: {
            community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
            request_reference_id: your_group[i].id,
          },
          relations: ['community'],
        });
        if (user_id > 0) {
          for (let j = 0; j < your_group[i].group_users.length; j++) {
            const currUser = this.findObject(
              your_group[i].group_users,
              user_id,
              '',
            );
            your_group[i].is_moderator =
              currUser && currUser.role === 'MODERATOR' ? true : false;
            your_group[i].is_member =
              currUser &&
              currUser.invite_status === 'ACCEPTED' &&
              currUser.user_id == user_id
                ? true
                : false;
            your_group[i].is_rejected =
              currUser &&
              currUser.invite_status === 'REJECTED' &&
              currUser.user_id == user_id
                ? true
                : false;
            your_group[i].is_requested =
              currUser &&
              currUser.invite_status === 'PENDING' &&
              currUser.user_id == user_id
                ? true
                : false;
            if (your_group[i].created_by == user_id) {
              your_group[i].is_host = true;
            } else {
              your_group[i].is_host = false;
            }
          }
        }
        if (community_group) {
          community_ids.push(community_group.community.id);
          your_group_id.push(your_group[i].id);
        }
      }

      const final_group = [];

      const community_request = await this.communityRequestRepository.find({
        where: {
          community: {
            id: In(community_ids),
          },
          community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
          request_reference_id: Not(In(your_group_id)),
        },
        relations: ['community'],
      });

      if (community_request.length) {
        for (let i = 0; i < community_request.length; i++) {
          community_request[i].request_reference_id
            ? final_group.push(community_request[i].request_reference_id)
            : '';
        }
      }

      const recommended_group: any = await this.communityGroupRepository.find({
        where: {
          id: In(final_group),
        },
      });

      if (recommended_group.length) {
        for (let i = 0; i < recommended_group.length; i++) {
          const reqCommunity = await this.communityRequestRepository.findOne({
            where: {
              request_reference_id: recommended_group[i].id,
              community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
            },
            relations: ['community'],
          });
          if (user_id > 0) {
            if (recommended_group[i].group_users) {
              for (
                let j = 0;
                j < recommended_group[i].group_users.length;
                j++
              ) {
                const currUser = this.findObject(
                  recommended_group[i].group_users,
                  user_id,
                  '',
                );
                recommended_group[i].is_moderator =
                  currUser && currUser.role === 'MODERATOR' ? true : false;
                recommended_group[i].is_member =
                  currUser &&
                  currUser.invite_status === 'ACCEPTED' &&
                  currUser.user_id == user_id
                    ? true
                    : false;
                recommended_group[i].is_rejected =
                  currUser &&
                  currUser.invite_status === 'REJECTED' &&
                  currUser.user_id == user_id
                    ? true
                    : false;
                recommended_group[i].is_requested =
                  currUser &&
                  currUser.invite_status === 'PENDING' &&
                  currUser.user_id == user_id
                    ? true
                    : false;
                if (recommended_group[i].created_by == user_id) {
                  recommended_group[i].is_host = true;
                } else {
                  recommended_group[i].is_host = false;
                }
              }
            }
          }
          recommended_group[i].community_request = reqCommunity
            ? reqCommunity
            : {};
        }
      }

      if (queryParam.community_id) {
        return {
          your_group: groupsRes,
          recommended_group: recommended_group,
          all_groups: groupsRes,
          page: queryParam.page,
          limit: queryParam.limit,
          total_pages: totalPages,
          count: total,
        };
      }
      return {
        your_group: your_group,
        recommended_group: recommended_group,
        all_groups: groupsRes,
        page: queryParam.page,
        limit: queryParam.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  async searchGroup(
    data: SearchDataDto,
    queryParam: SearchDataQueryGroupDto,
    user_id: number,
  ): Promise<any> {
    try {
      const group: any = await this.communityGroupRepository
        .createQueryBuilder('group')
        .where('LOWER(group.group_name) LIKE LOWER(:data) AND status=:status', {
          data: `%${data.search}%`,
          status: GROUP_STATUS.ACCEPTED,
        });
      if (queryParam.group_type) {
        group.andWhere('group.group_type = :group_type', {
          group_type: `${queryParam.group_type}`,
        });
      }
      if (queryParam.community_id) {
        group.andWhere('group.community_id = :community_id', {
          community_id: `${queryParam.community_id}`,
        });
      }
      const groups = await group.getMany();

      for (let i = 0; i < groups.length; i++) {
        const counts = await this.groupUserRepository.count({
          where: {
            group: { id: groups[i].id },
            invite_status: GROUP_INVITE_STATUS.ACCEPTED,
          },
        });

        if (user_id > 0) {
          const groupUser = await this.groupUserRepository.find({
            where: {
              group: { id: groups[i].id },
            },
          });
          groups[i].group_users = groupUser;
          const group_users = [];

          for (let j = 0; j < groups[i].group_users.length; j++) {
            const element = groups[i].group_users[j];
            if (element.invite_status != GROUP_INVITE_STATUS.REJECTED) {
              group_users.push(element);
            }
          }
          groups[i].group_users = group_users;
          const currUser = this.findObject(groups[i].group_users, user_id, '');
          groups[i].is_moderator =
            currUser && currUser.role === 'MODERATOR' ? true : false;
          groups[i].is_member =
            currUser &&
            currUser.invite_status === 'ACCEPTED' &&
            currUser.user_id == user_id
              ? true
              : false;
          groups[i].is_rejected =
            currUser &&
            currUser.invite_status === 'REJECTED' &&
            currUser.user_id == user_id
              ? true
              : false;
          groups[i].is_requested =
            currUser &&
            currUser.invite_status === 'PENDING' &&
            currUser.user_id == user_id
              ? true
              : false;
          if (groups[i].created_by == user_id) {
            groups[i].is_host = true;
          } else {
            groups[i].is_host = false;
          }
        }
        groups[i].member_count = counts;
      }
      return groups;
    } catch (err) {
      console.log('ERR -->', err);
      throw new InternalServerErrorException(err);
    }
  }

  async getGroupById(id: GetByIdDto, user_id: number): Promise<any> {
    try {
      const groupQuery = await this.communityGroupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.group_users', 'group_users');

      if (user_id != 0) {
        const whereQuery = 'group.id = :id AND group.status = :status';

        groupQuery.where(whereQuery, {
          id: id.id,
          status: GROUP_STATUS.ACCEPTED,
        });
      }

      const group = await groupQuery.getOne();

      if (!group) {
        return {
          status: 500,
          message: 'Group Not Found',
        };
      }

      const groupRes: any = group;
      if (groupRes.created_by) {
        const user = await this.getUser(group.created_by);
        groupRes.group_created_by = user;
      }

      if (user_id > 0) {
        const currUser = this.findObject(groupRes.group_users, user_id, '');
        groupRes.is_host = groupRes.created_by == user_id ? true : false;
        groupRes.is_moderator =
          currUser && currUser.role === 'MODERATOR' ? true : false;
        groupRes.is_member =
          currUser &&
          currUser.invite_status === 'ACCEPTED' &&
          currUser.user_id == user_id
            ? true
            : false;
        groupRes.is_requested =
          currUser &&
          currUser.invite_status === 'PENDING' &&
          currUser.user_id == user_id
            ? true
            : false;
      }
      return groupRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGroupMembers(id: number, data: PaginationDto): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const group = await this.communityGroupRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!group) {
        return {
          status: 500,
          message: 'No group found.',
        };
      }

      const groupMember = await this.groupUserRepository.find({
        where: {
          group: {
            id: group.id,
          },
          invite_status: GROUP_INVITE_STATUS.ACCEPTED,
        },
        take: data.limit,
        skip,
        relations: ['group'],
      });
      if (!groupMember.length) {
        return {
          status: 500,
          message: 'No group member found.',
        };
      }

      const groupRes: any = [...groupMember];
      const group_member = [];
      const moderators = [];
      const host = [];
      let things_in_common = [];
      for (let i = 0; i < groupRes.length; i++) {
        const createdBy = await this.getUser(Number(groupRes[i].user_id));
        groupRes[i].user_id = createdBy;
        if (groupRes[i].role == GROUP_USER_ROLE.MEMBER) {
          group_member.push(groupRes[i]);
        }
        if (groupRes[i].role == GROUP_USER_ROLE.MODERATOR) {
          moderators.push(groupRes[i]);
        }
        if (groupRes[i].role == GROUP_USER_ROLE.ADMIN) {
          host.push(groupRes[i]);
        }
        const requestGroups = await this.communityRequestRepository.find({
          where: {
            community: {
              id: group.id,
            },
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
      const total = await this.groupUserRepository.count({
        where: {
          group: {
            id: group.id,
          },
          invite_status: GROUP_INVITE_STATUS.ACCEPTED,
        },
        take: data.limit,
        skip,
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        group_member: group_member,
        moderators: moderators,
        host: host,
        things_in_common: things_in_common,
        all_members: groupRes,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGroupTopics(id: number, user_id: number): Promise<any> {
    try {
      const topic = await this.communityGroupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.topics', 'topics')
        .where('group.id = :id', { id: id })
        .andWhere('topics.status = :status', { status: TOPIC_STATUS.ACCEPTED })
        .getOne();

      let topicRes: any = [];
      if (topic) {
        const topics: any = [...topic.topics];
        for (let i = 0; i < topics.length; i++) {
          const likes = await this.topicLikeRepository.find({
            where: {
              community_topic: topics[i],
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
        }
        topicRes = topics;
      }
      return topicRes || [];
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getGroupByCommunityId(
    id: number,
    user_id: number,
  ): Promise<ICommunityGroup[]> {
    try {
      const requestIds = await this.communityRequestRepository.find({
        where: {
          community: {
            id: id,
          },
          community_request_type: COMMUNITY_REQUEST_TYPE.GROUP,
        },
        relations: ['community'],
      });
      const groupRes: any = [];

      for (let i = 0; i < requestIds.length; i++) {
        const group: any = await this.communityGroupRepository.findOne({
          where: {
            id: requestIds[i].request_reference_id,
          },
        });
        if (group) {
          const group_user = await this.groupUserRepository.find({
            where: {
              group: { id: group.id },
            },
          });
          group.member_counts = group_user.length;
          const currUser = this.findObject(group_user, user_id, '');
          group.is_member =
            currUser &&
            currUser.invite_status === 'ACCEPTED' &&
            currUser.user_id == user_id
              ? true
              : false;
          group.is_moderator =
            currUser && currUser.role === 'MODERATOR' ? true : false;
          group.is_rejected =
            currUser &&
            currUser.invite_status === 'REJECTED' &&
            currUser.user_id == user_id
              ? true
              : false;
          group.is_requested =
            currUser &&
            currUser.invite_status === 'PENDING' &&
            currUser.user_id == user_id
              ? true
              : false;
          if (group.created_by) {
            group.is_host = user_id == group.created_by ? true : false;
            group.created_by = await this.getUser(group.created_by);
          }
          group.community_request = requestIds[i];
          groupRes.push(group);
        }
      }
      return groupRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteGroup(id: number, user_id: number): Promise<any> {
    try {
      const cg = await this.communityGroupRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });
      if (!cg) {
        throw new HttpException(
          'GROUP_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.communityGroupRepository.delete(id);

      return {
        status: 200,
        message: 'Group deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGroupByIdAdmin(id: number): Promise<any> {
    try {
      const group = await this.communityGroupRepository.findOne({
        where: {
          id: id,
        },
        relations: ['group_rules', 'group_users', 'topics'],
      });

      const groupRes: any = group;

      if (group.created_by) {
        const user = await this.getUser(group.created_by);
        groupRes.created_by = user;
      }

      return groupRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateGroupAdmin(data: any): Promise<any> {
    try {
      const group = await this.communityGroupRepository.findOne({
        where: {
          id: data.id,
        },
      });

      if (!group) {
        return {
          status: 500,
          message: 'Group Not Found',
        };
      }

      const communityTopicsArr: CommunityTopic[] = [];
      if (data.topics && data.topics !== '') {
        const topicsArr = data.topics.split(',');
        for (let i = 0; i < topicsArr.length; i++) {
          const topic = await this.communityTopicRepository.findOne({
            where: {
              id: parseInt(topicsArr[i]),
            },
          });
          communityTopicsArr.push(topic);
        }
      }
      if (data.invited_members && data.invited_members != '') {
        const invitedMembers = data.invited_members.split(',');

        for (let i = 0; i < invitedMembers.length; i++) {
          const gu = await this.groupUserRepository.findOne({
            where: { id: invitedMembers[i] },
          });
          if (!gu) {
            const g_user = new GroupUsers();

            g_user.group = group;
            g_user.user_id = Number(invitedMembers[i]);
            g_user.invite_status = GROUP_INVITE_STATUS.PENDING;
            g_user.role = GROUP_USER_ROLE.MEMBER;
            await this.groupUserRepository.save(g_user);

            const invitedUser = await firstValueFrom(
              this.userClient.send<any>('get_user_by_id', {
                userId: Number(invitedMembers[i]),
              }),
            );

            const createTokenResponse = await firstValueFrom(
              this.tokenClient.send(
                'community_join_token_create',
                JSON.stringify(invitedUser),
              ),
            );
            const userSetting = await this.getUserSetting(invitedMembers[i]);
            let sentMail = true;
            if (userSetting.length) {
              for (let j = 0; j < userSetting.length; j++) {
                sentMail =
                  userSetting[j].setting.key == 'group_email_notification' &&
                  userSetting[j].setting.status == 'ACTIVE' &&
                  userSetting[j].value == 'true'
                    ? true
                    : false;
                if (sentMail == true) {
                  const payload: IMailPayload = {
                    template: 'INVITE_USER_TO_GROUP',
                    payload: {
                      emails: [invitedUser.email],
                      data: {
                        group_name: group.group_name,
                        name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                        invite_by: ``,
                        invitationLink: `${this.configService.get<string>(
                          'join_group_url',
                        )}/${group.id}/${
                          createTokenResponse.verificationToken
                        }`,
                      },
                      subject: `You got invite to join ${group.group_name} at hubbers`,
                    },
                  };
                  this.mailClient.emit('send_email', payload);
                }
              }
            }
          }
        }
      }
      delete data.invited_members;
      group.topics = communityTopicsArr;
      if (data.community_id) {
        const community = await this.communityRepository.findOne({
          where: {
            id: data.community_id,
          },
        });

        if (!community) {
          return {
            status: 500,
            message: 'Community Not Found',
          };
        }
        delete data.community_id;
        data.community = community;
      }
      await this.communityGroupRepository.save(data);
      return await this.getGroupByIdAdmin(data.id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteGroupAdmin(id: any): Promise<any> {
    try {
      const cg = await this.getGroupByIdAdmin(id);
      if (!cg) {
        throw new HttpException(
          'GROUP_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.communityGroupRepository.delete(id);

      return {
        status: 200,
        message: 'Group deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async groupAllow(data: AllowGroupDto): Promise<any> {
    try {
      const groupUser = await this.groupUserRepository.findOne({
        where: {
          group: {
            id: data.group_id,
          },
          user_id: data.user_id,
        },
      });

      if (!groupUser) {
        throw new HttpException(
          'EVENT_USER_REQUEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      groupUser.invite_status = data.status;

      await this.groupUserRepository.update(groupUser.id, groupUser);

      return {
        status: 200,
        message: `You have successfully ${data.status.toLowerCase()} the user`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async joinedUserStatus(status: StatusGroupMemberDto): Promise<any> {
    try {
      let where;
      if (status.status == GROUP_INVITE_STATUS.ALL) {
        where = {
          group: {
            id: status.id,
          },
        };
      } else {
        where = {
          group: {
            id: status.id,
          },
          invite_status: status.status,
        };
      }
      const groupMember = await this.groupUserRepository.find({
        where,
        relations: ['group'],
      });
      if (!groupMember) {
        throw new HttpException(
          'GROUP_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const groupMemberRes: any = [...groupMember];

      for (let i = 0; i < groupMemberRes.length; i++) {
        if (groupMemberRes[i].user_id) {
          groupMemberRes[i].user = await this.getUser(
            groupMemberRes[i].user_id,
          );
        }
      }

      if (groupMemberRes.length > 0) {
        return groupMemberRes;
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

  public async groupsByType(type: GroupTypeDto, user_id: number): Promise<any> {
    try {
      const groupMember = await this.communityGroupRepository.find({
        where: {
          group_type: type.group_type,
          status: GROUP_STATUS.ACCEPTED,
        },
      });
      const groupMemberRes: any = [...groupMember];
      for (let i = 0; i < groupMemberRes.length; i++) {
        const group_user = await this.groupUserRepository.find({
          where: {
            group: groupMemberRes[i],
            invite_status: GROUP_INVITE_STATUS.ACCEPTED,
          },
        });

        const currUser = this.findObject(group_user, user_id, '');
        groupMemberRes[i].member_counts = group_user.length;
        groupMemberRes[i].is_moderator =
          currUser && currUser.role === 'MODERATOR' ? true : false;
        groupMemberRes[i].is_rejected =
          currUser &&
          currUser.invite_status === 'REJECTED' &&
          currUser.user_id == user_id
            ? true
            : false;
        groupMemberRes[i].is_requested =
          currUser &&
          currUser.invite_status === 'PENDING' &&
          currUser.user_id == user_id
            ? true
            : false;
        groupMemberRes[i].is_member =
          currUser &&
          currUser.invite_status === 'ACCEPTED' &&
          currUser.user_id == user_id
            ? true
            : false;
        if (groupMemberRes[i].created_by == user_id) {
          groupMemberRes[i].is_host = true;
        } else {
          groupMemberRes[i].is_host = false;
        }
        if (groupMemberRes[i].created_by) {
          groupMemberRes[i].created_by = await this.getUser(
            groupMemberRes[i].created_by,
          );
        }
      }

      if (groupMemberRes.length > 0) {
        return groupMemberRes;
      } else {
        return {
          status: 200,
          message: 'No groups found',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
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

  public async joinInvitedGroup(
    data: JoinInvitedGroupDto,
    user_id: number,
  ): Promise<any> {
    try {
      const group = await this.communityGroupRepository.findOne({
        where: {
          invitation_code: data.token,
        },
      });
      if (!group) {
        throw new HttpException(
          'INVALID_INVITATION_TOKEN',
          HttpStatus.NOT_FOUND,
        );
      }

      const userInvited = await this.groupUserRepository.findOne({
        where: {
          user_id: user_id,
          group: {
            id: group.id,
          },
        },
        relations: ['group'],
      });
      if (!userInvited) {
        throw new HttpException('NO_INVITATION_FOUND', HttpStatus.NOT_FOUND);
      }

      if (userInvited.invite_status == GROUP_INVITE_STATUS.ACCEPTED) {
        return {
          status: 200,
          message: 'User already joined group',
        };
      }

      userInvited.invite_status = GROUP_INVITE_STATUS.ACCEPTED;

      // Send email to the community host about accept

      await this.groupUserRepository.update(userInvited.id, userInvited);
      const invitedUser = await firstValueFrom(
        this.userClient.send('get_user_by_id', {
          userId: userInvited.user_id,
        }),
      );

      // let groupHosts: any;
      // if (group.created_by) {
      //   groupHosts = await this.getUser(Number(group.created_by));
      // }
      const userSetting = await this.getUserSetting(group.created_by);
      let sentNotification = true;
      if (userSetting.length) {
        for (let i = 0; i < userSetting.length; i++) {
          sentNotification =
            userSetting[i].setting.key == 'group_push_notification' &&
            userSetting[i].setting.status == 'ACTIVE' &&
            userSetting[i].value == 'true'
              ? true
              : false;
          if (sentNotification == true) {
            const admin_notification = await firstValueFrom(
              this.adminClient.send<any>(
                'get_notification_by_type',
                'GROUP_JOIN',
              ),
            );
            const joinRequestNotification = {
              title: admin_notification.notification_title
                .replace('*user*', invitedUser.general_profile.first_name)
                .replace('*group name*', group.group_name),
              content: admin_notification.notification_content
                .replace('*user*', invitedUser.general_profile.first_name)
                .replace('*group name*', group.group_name),
              type: admin_notification.notification_type,
              notification_from: user_id,
              notification_to: group.created_by,
              payload: userInvited,
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
      const groupActivity = new GroupActivity();
      groupActivity.user_id = userInvited.user_id;
      groupActivity.group = userInvited.group;
      groupActivity.activity = `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name} joined group ${userInvited.group.group_name}`;
      await this.groupActivityRepository.save(groupActivity);
      return {
        status: 200,
        message: 'Joined group successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUserSetting(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_setting_by_id', user_id),
    );
    return user;
  }

  public async getGroupActivity(data: any, user_id: number): Promise<any> {
    try {
      const Activity = await this.groupActivityRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
        where: {
          user_id: user_id,
        },
      });
      if (!Activity) {
        throw new HttpException(
          'ACTIVITY_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const ActivityRes: any = Activity;
      for (let i = 0; i < Activity.length; i++) {
        const userId = Activity[i];
        if (userId.user_id) {
          const user = await firstValueFrom(
            this.userClient.send('get_general_profile_by_id', {
              userId: user_id,
            }),
          );
          ActivityRes[i].user_avatar = user.avatar;
        }
      }
      return ActivityRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getGroupActivityById(id: number, user_id: number): Promise<any> {
    try {
      const Activity = await this.groupActivityRepository.findOne({
        where: {
          id: id,
          user_id: user_id,
        },
      });

      const ActivityRes: any = Activity;
      const userId = Activity;
      if (userId.user_id) {
        const user = await firstValueFrom(
          this.userClient.send('get_general_profile_by_id', {
            userId: user_id,
          }),
        );
        ActivityRes.user_avatar = user.avatar;
      }
      return ActivityRes;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getAdminGroupByStatus(status: GROUP_STATUS): Promise<any> {
    try {
      const where = status != 'ALL' ? { status: status } : '';
      const group: any = await this.communityGroupRepository.findOne({
        where: { ...where },
        relations: ['group_rules', 'group_users', 'topics'],
      });
      if (!group) {
        return {
          status: 500,
          message: 'No group found.',
        };
      }
      const groupRes: any = group;
      for (let i = 0; i < group.length; i++) {
        const element = group[i];
        if (element.created_by) {
          const user = await this.getUser(element.created_by);
          groupRes[i].created_by = user;
        }
      }

      return groupRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async leaveGroup(data: LeaveGroupDto, user_id: number) {
    const group = await this.getGroupById({ id: data.id }, user_id);
    const user = this.findObject(group.group_users, user_id, '');
    if (!user) {
      return {
        status: 500,
        message: 'No user found in community.',
      };
    }
    const leaveGroup = new LeaveGroup();
    leaveGroup.group_id = data.id;
    leaveGroup.user_id = user_id;
    leaveGroup.removed_by = user_id;
    leaveGroup.reason = data.reason;
    await this.leaveGroupRepository.save(leaveGroup);
    await this.groupUserRepository.delete(user.id);
    const invitedUser = await firstValueFrom(
      this.userClient.send('get_user_by_id', {
        userId: user_id,
      }),
    );
    const groupActivity = new GroupActivity();
    groupActivity.group = group;
    groupActivity.activity = `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name} left group ${group.group_name}`;
    await this.groupActivityRepository.save(groupActivity);
    return {
      status: 200,
      message: 'Group leave successfully.',
    };
  }

  public async reportGroup(data: ReportGroupDto, user_id: number) {
    const group = await this.getGroupById({ id: data.id }, user_id);
    if (group.status && group.status == 500) {
      return {
        status: 500,
        message: 'No group found',
      };
    }
    const user = this.findObject(group.group_users, user_id, '');
    if (!user) {
      return {
        status: 500,
        message: 'No user found in group.',
      };
    }
    const reportGroup = new GroupReport();
    reportGroup.group = group;
    reportGroup.user_id = user_id;
    reportGroup.reason = data.reason;
    await this.groupReportRepository.save(reportGroup);
    return {
      status: 200,
      message: 'Group reported successfully.',
    };
  }

  public async inviteUsers(
    invites: InviteUsersToGroupDto,
    user_id: number,
  ): Promise<any> {
    try {
      const group = await this.communityGroupRepository.findOne({
        where: {
          id: invites.group_id,
        },
      });

      if (!group) {
        throw new HttpException(
          'GROUP_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const invitedByUser = await firstValueFrom(
        this.userClient.send('get_user_by_id', {
          userId: user_id,
        }),
      );
      for (let i = 0; i < invites.users.length; i++) {
        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_email', {
            email: invites.users[i].email,
          }),
        );
        if (invitedUser) {
          const grpUser = await this.groupUserRepository.findOne({
            where: {
              user_id: invitedUser.id,
              group: {
                id: invites.group_id,
              },
            },
          });
          if (grpUser && grpUser.invite_status == GROUP_INVITE_STATUS.PENDING) {
            return {
              status: 500,
              message: `You've already requested to join this Group, Please wait for Host or Moderator to approve your request.`,
            };
          }
          if (
            grpUser &&
            grpUser.invite_status == GROUP_INVITE_STATUS.ACCEPTED
          ) {
            return {
              status: 200,
              message: 'User already joined Group.',
            };
          }

          if (
            grpUser &&
            grpUser.invite_status == GROUP_INVITE_STATUS.REJECTED
          ) {
            grpUser.invited_by = user_id;
            grpUser.invite_status = GROUP_INVITE_STATUS.PENDING;
            await this.groupUserRepository.update(grpUser.id, grpUser);
          }

          if (!grpUser) {
            const groupJoin = new GroupUsers();
            groupJoin.group = group;
            groupJoin.invited_by = user_id;
            groupJoin.role = invites.group_role;
            groupJoin.user_id = invitedUser.id;
            if (group.privacy === GROUP_PRIVACY.PUBLIC) {
              groupJoin.invite_status = GROUP_INVITE_STATUS.ACCEPTED;
            } else if (
              group.privacy === GROUP_PRIVACY.PRIVATE &&
              invitedUser.id == group.created_by
            ) {
              groupJoin.invite_status = GROUP_INVITE_STATUS.ACCEPTED;
            } else {
              groupJoin.invite_status = GROUP_INVITE_STATUS.PENDING;
            }

            await this.groupUserRepository.save(groupJoin);
            const userSetting = await this.getUserSetting(invitedUser.id);
            let sentMail = true;
            if (userSetting.length) {
              for (let j = 0; j < userSetting.length; j++) {
                sentMail =
                  userSetting[j].setting.key == 'group_email_notification' &&
                  userSetting[j].setting.status == 'ACTIVE' &&
                  userSetting[j].value == 'true'
                    ? true
                    : false;

                if (sentMail == true) {
                  const payload: IMailPayload = {
                    template: 'INVITE_USER_TO_GROUP_DYNAMIC',
                    payload: {
                      emails: [invitedUser.email],
                      data: {
                        group_name: group.group_name,
                        name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                        invite_by: `${invitedByUser.general_profile.first_name} ${invitedByUser.general_profile.last_name}`,
                        invitationLink: `${this.configService.get<string>(
                          'join_group_url',
                        )}/${group.invitation_code}`,
                      },
                      subject: `You got invite to join ${group.group_name} at hubbers`,
                    },
                  };
                  this.mailClient.emit('send_email', payload);
                }
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

  public async updateInviteUsersToGroup(id: number, data: any): Promise<any> {
    try {
      const communityGroup = await this.groupUserRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!communityGroup) {
        return {
          statusCode: 500,
          message: 'Group Member not found',
        };
      }
      await this.groupUserRepository.update(id, { role: data.group_role });

      return {
        status: 200,
        message: 'Group Member Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async removeCommunityMember(
    data: RemoveGroupMemberDto,
    user_id: number,
  ) {
    const group = await this.getGroupById({ id: data.group_id }, user_id);
    const removeId = data.id;
    for (let i = 0; i < removeId.length; i++) {
      const user = this.findObject(group.group_users, removeId[i], '');
      if (!user) {
        return {
          status: 500,
          message: 'No user found in group.',
        };
      }
      const leaveCommunity = new LeaveGroup();
      leaveCommunity.group_id = data.group_id;
      leaveCommunity.user_id = removeId[i];
      leaveCommunity.reason = data.reason;
      leaveCommunity.removed_by = user_id;
      await this.leaveGroupRepository.save(leaveCommunity);
      await this.communityGroupRepository.delete(user.id);
    }
    return {
      status: 200,
      message: 'User removed from community.',
    };
  }

  async removeGroupUser(id: number, user_id: number): Promise<any> {
    try {
      const gu = await this.groupUserRepository.findOne({
        where: {
          id: id,
          user_id: user_id,
        },
      });
      if (!gu) {
        throw new HttpException(
          'GROUP_USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.groupUserRepository.delete(id);

      return {
        status: 200,
        message: 'Group User deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async changeGroupStatusAdmin(data: any, user_id: number) {
    try {
      const event = await this.communityGroupRepository.findOne({
        where: {
          id: data.id,
        },
      });

      if (!event) {
        throw new HttpException(
          'GROUP_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      event.status = data.status;
      await this.communityGroupRepository.save(event);

      const update = await this.getGroupById({ id: data.id }, user_id);

      return update;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async joinGroup(id: number, user_id: number): Promise<any> {
    try {
      const group = await this.communityGroupRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!group) {
        throw new HttpException(
          'GROUP_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const checkUser = await this.groupUserRepository.findOne({
        where: {
          group: {
            id: group.id,
          },
          user_id: user_id,
        },
      });

      if (
        checkUser &&
        checkUser.invite_status == GROUP_INVITE_STATUS.ACCEPTED
      ) {
        return {
          status: 500,
          message: 'User already joined group.',
        };
      }

      if (checkUser && checkUser.invite_status == GROUP_INVITE_STATUS.PENDING) {
        return {
          status: 500,
          message: `You've already requested to join this group, Please wait for Host or Moderator to approve your request.`,
        };
      }
      if (checkUser) {
        await this.groupUserRepository.delete(checkUser.id);
      }

      const newGroupUser = new GroupUsers();
      newGroupUser.group = group;
      newGroupUser.user_id = user_id;
      newGroupUser.invite_status =
        group.privacy === GROUP_PRIVACY.PUBLIC
          ? GROUP_INVITE_STATUS.ACCEPTED
          : GROUP_INVITE_STATUS.PENDING;
      newGroupUser.role = GROUP_USER_ROLE.MEMBER;

      await this.groupUserRepository.save(newGroupUser);

      const invitedUser = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(user_id),
        }),
      );

      const groupHost = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(group.created_by),
        }),
      );
      // let groupHosts: any;
      // if (group.created_by) {
      //   groupHosts = await this.getUser(Number(group.created_by));
      // }
      if (group.privacy === GROUP_PRIVACY.PRIVATE) {
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'GROUP_JOIN_REQUEST',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*group name*', group.group_name),
          content: admin_notification.notification_content
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*group name*', group.group_name),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: group.created_by,
          payload: newGroupUser,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );
      } else {
        const userSetting = await this.getUserSetting(Number(group.created_by));
        let sentNotification = true;
        let sentMail = true;
        if (userSetting.length) {
          for (let i = 0; i < userSetting.length; i++) {
            sentNotification =
              userSetting[i].setting.key == 'group_push_notification' &&
              userSetting[i].setting.status == 'ACTIVE' &&
              userSetting[i].value == 'true'
                ? true
                : false;
            sentMail =
              userSetting[i].setting.key == 'group_email_notification' &&
              userSetting[i].setting.status == 'ACTIVE' &&
              userSetting[i].value == 'true'
                ? true
                : false;
            if (sentNotification == true) {
              const admin_notification = await firstValueFrom(
                this.adminClient.send<any>(
                  'get_notification_by_type',
                  'GROUP_JOIN',
                ),
              );

              const joinRequestNotification = {
                title: admin_notification.notification_title
                  .replace('*user*', invitedUser.general_profile.first_name)
                  .replace('*group name*', group.group_name),
                content: admin_notification.notification_content
                  .replace('*user*', invitedUser.general_profile.first_name)
                  .replace('*group name*', group.group_name),
                type: admin_notification.notification_type,
                notification_from: user_id,
                notification_to: group.created_by,
                payload: newGroupUser,
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
                template: 'JOIN_REQUEST',
                payload: {
                  emails: [groupHost.email],
                  data: {
                    host_name: groupHost
                      ? groupHost.general_profile.first_name
                      : '',
                    name: group.group_name,
                    user_name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
                    link: `${this.configService.get<string>(
                      'group_join_request_url',
                    )}/${group.id}/members/${newGroupUser.id}`,
                  },
                  subject: `You got request from ${invitedUser.general_profile.first_name} to join ${group.group_name} at hubbers`,
                },
              };

              this.mailClient.emit('send_email', payload);
            }
          }
        }
      }

      return {
        status: 200,
        message: 'Group Joined successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
