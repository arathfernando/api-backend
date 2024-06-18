import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import {
  CLIME_PRIZE_STATUS,
  CONTESTANT_ROLE,
  CONTESTANT_STATUS,
  CONTEST_STATE,
  CONTEST_SUBMISSION_STATUS,
  TRUE_FALSE,
  YES_NO,
} from 'src/core/constant/enum.constant';
import {
  ContestReactionDto,
  ContestSubmissionDto,
  CreateContestCriteriaDto,
  CreateContestDto,
  CreateContestRuleDto,
  SearchWithPaginationDto,
} from 'src/core/dtos/contests';
import { JoinContest } from 'src/core/dtos/contests/join-contest.dto';
import { IMailPayload } from 'src/core/interfaces';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  Contest,
  ContestCoOrganizer,
  ContestCriteria,
  ContestCustomerIdentity,
  ContestMarks,
  ContestPrize,
  ContestRules,
  ContestContestant,
  ContestSubmission,
  ContestSubmissionReview,
  ContestTemplates,
  ContestReaction,
} from 'src/database/entities';
import { ContestClaimPrize } from 'src/database/entities/contest-claim-prize.entity';
import { ContestOwnCriteriaSubmission } from 'src/database/entities/contest-own-criteria-submissions.entity';
import { ContestOwnCriteria } from 'src/database/entities/contest-own-criteria.entity';
import { ContestSubmissionUpload } from 'src/database/entities/contest-submissions-upload.entity';
import { ILike, In, LessThan, Like, Not, Repository } from 'typeorm';

@Injectable()
export class ContestService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('TOKEN_SERVICE') private readonly tokenClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @InjectRepository(Contest)
    private readonly contestRepository: Repository<Contest>,
    @InjectRepository(ContestCoOrganizer)
    private readonly contestCoOrganizerRepository: Repository<ContestCoOrganizer>,
    @InjectRepository(ContestCriteria)
    private readonly contestCriteriaRepository: Repository<ContestCriteria>,
    @InjectRepository(ContestCustomerIdentity)
    private readonly contestCustomerIdentityRepository: Repository<ContestCustomerIdentity>,
    @InjectRepository(ContestMarks)
    private readonly contestMarksRepository: Repository<ContestMarks>,
    @InjectRepository(ContestOwnCriteria)
    private readonly contestOwnCriteriaRepository: Repository<ContestOwnCriteria>,
    @InjectRepository(ContestPrize)
    private readonly contestPrizeRepository: Repository<ContestPrize>,
    @InjectRepository(ContestRules)
    private readonly contestRulesRepository: Repository<ContestRules>,
    @InjectRepository(ContestContestant)
    private readonly contestContestantRepository: Repository<ContestContestant>,
    @InjectRepository(ContestSubmission)
    private readonly contestSubmissionRepository: Repository<ContestSubmission>,
    @InjectRepository(ContestOwnCriteriaSubmission)
    private readonly contestOwnCriteriaSubmissionRepository: Repository<ContestOwnCriteriaSubmission>,
    @InjectRepository(ContestSubmissionUpload)
    private readonly contestSubmissionUploadRepository: Repository<ContestSubmissionUpload>,
    @InjectRepository(ContestSubmissionReview)
    private readonly contestSubmissionReviewRepository: Repository<ContestSubmissionReview>,
    @InjectRepository(ContestTemplates)
    private readonly contestTemplateRepository: Repository<ContestTemplates>,
    @InjectRepository(ContestReaction)
    private readonly contestReactionRepository: Repository<ContestReaction>,
    @InjectRepository(ContestClaimPrize)
    private readonly contestClaimPrizeRepository: Repository<ContestClaimPrize>,

    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    this.userClient.connect();
    this.mailClient.connect();
    this.tokenClient.connect();
    this.adminClient.connect();
  }

  public async createContest(
    data: CreateContestDto,
    user_id: number,
    contest_state = null,
    file: any,
  ): Promise<any> {
    try {
      const contestCategory = await firstValueFrom(
        this.adminClient.send<any>(
          'get_contest_category_by_id',
          data.contest_type_id,
        ),
      );

      if (!contestCategory) {
        throw new HttpException(
          'CONTEST_CATEGORY_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      let contest_cover;
      if (file && typeof file != 'string') {
        contest_cover = await this.s3Service.uploadFile(file);
        contest_cover = contest_cover.Location;
      } else {
        if (file) {
          contest_cover = file;
        }
      }
      const contestCreate = new Contest();

      contestCreate.contest_type_id = data.contest_type_id;
      contestCreate.title = data.title;
      contestCreate.industry =
        data.industry && data.industry.length > 0
          ? data.industry.split(',')
          : [];
      contestCreate.goals =
        data.goals && data.goals.length > 0 ? data.goals.split(',') : [];
      contestCreate.tech =
        data.tech && data.tech.length > 0 ? data.tech.split(',') : [];
      contestCreate.launch_globally = data.launch_globally;
      contestCreate.country_contest = data.country_contest;
      contestCreate.no_of_participants = data.no_of_participants;
      contestCreate.everyone_can_participate = data.everyone_can_participate;
      contestCreate.hubbers_point_attribute = data.hubbers_point_attribute;
      contestCreate.no_of_judges = data.no_of_judges;
      contestCreate.created_by = user_id;
      contestCreate.contest_state =
        contest_state != null ? contest_state : CONTEST_STATE.DRAFTED;
      contestCreate.no_of_extra_judges = data.no_of_extra_judges;
      contestCreate.no_of_revisions = data.no_of_revisions;
      contestCreate.contest_cover = contest_cover;
      contestCreate.contest_start_date = data.contest_start_date;
      contestCreate.contest_end_date = data.contest_end_date;
      contestCreate.social_links = data.social_links;
      await this.contestRepository.save(contestCreate);
      const admin_notification = await firstValueFrom(
        this.adminClient.send<any>(
          'get_notification_by_type',
          'CONTEST_CREATED',
        ),
      );

      const joinRequestNotification = {
        title: admin_notification.notification_title.replace(
          '*contest name*',
          data.title,
        ),
        content: admin_notification.notification_content.replace(
          '*contest name*',
          data.title,
        ),
        type: admin_notification.notification_type,
        notification_from: user_id,
        notification_to: contestCreate.created_by,
        payload: contestCreate,
      };
      await firstValueFrom(
        this.notificationClient.send<any>(
          'create_notification',
          JSON.stringify(joinRequestNotification),
        ),
      );
      contestCreate.social_links = JSON.parse(contestCreate.social_links);
      return contestCreate;
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
  public async updateContest(
    id: number,
    data: any,
    user_id: number,
    file: any,
  ): Promise<any> {
    try {
      let current_user_organizer = null;
      if (user_id && user_id != 0) {
        const current_user = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: user_id,
          }),
        );

        const contestInfo = await this.contestRepository.findOne({
          where: {
            id: id,
          },
          relations: ['contest_customer_info'],
        });

        if (contestInfo.contest_customer_info) {
          current_user_organizer =
            await this.contestCoOrganizerRepository.findOne({
              where: {
                email: current_user.email,
                contest_customer_identity: {
                  id: contestInfo.contest_customer_info.id,
                },
              },
            });
        }
      }
      const where =
        user_id === 0 || (current_user_organizer && current_user_organizer.id)
          ? { id: id }
          : { id: id, created_by: user_id };
      const contest = await this.contestRepository.findOne({
        where: where,
        relations: ['contestant', 'contest_customer_info'],
      });

      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      let company_logo;
      if (file) {
        if (typeof file != 'string') {
          company_logo = await this.s3Service.uploadFile(file);
          data.contest_cover = company_logo.Location;
        } else {
          data.contest_cover = file;
        }
      }
      if (data.tech) {
        data.tech = data.tech.split(',');
      }
      if (data.industry) {
        data.industry = data.industry.split(',');
      }
      if (data.goals) {
        data.goals = data.goals.split(',');
      }
      if (data.contest_state && data.contest_state == CONTEST_STATE.ONGOING) {
        data.published_date = new Date().toISOString();
      }
      await this.contestRepository.update(id, data);
      if (data.contest_state) {
        for (let i = 0; i < contest.contestant.length; i++) {
          //NOTIFICATION TO CO ORGANIZER
          if (contest.contest_customer_info) {
            const coOrg = await this.contestCoOrganizerRepository.find({
              where: {
                contest_customer_identity: {
                  id: contest.contest_customer_info.id,
                },
              },
            });

            for (let k = 0; k < coOrg.length; k++) {
              const userSetting = await this.getUserSetting(Number(user_id));
              let sentNotification = true;
              let sentMail = true;
              if (userSetting.length) {
                for (let j = 0; j < userSetting.length; j++) {
                  sentNotification =
                    userSetting[j].setting.key ==
                      'community_push_notification' &&
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
                }
              }
              if (sentNotification == true) {
                const joinRequestNotification = {
                  notification_from: user_id,
                  notification_to: coOrg[k].created_by,
                  payload: contest,
                  content: `Congrats, your contest ${contest.title} has been accepted and will start on ${contest.contest_start_date}.`,
                  type: 'CONTEST_STATUS',
                };

                await firstValueFrom(
                  this.notificationClient.send<any>(
                    'create_notification',
                    JSON.stringify(joinRequestNotification),
                  ),
                );
              }
              if (sentMail) {
                const contestStateUpdateNotification = {
                  notification_from: user_id,
                  payload: contest,
                  content: `${contest.title} status updated.`,
                  type: 'CONTEST_STATUS',
                };

                await firstValueFrom(
                  this.notificationClient.send<any>(
                    'create_global_notification',
                    JSON.stringify(contestStateUpdateNotification),
                  ),
                );
              }
            }
          }
        }
      }
      return {
        status: 200,
        message: 'Contest updated',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestById(id: number): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: id,
        },
        relations: ['contest_customer_info'],
      });

      if (!contest) {
        return {
          status: 500,
          message: 'Contest Not Found',
        };
      }
      const contestRes: any = contest;
      const contestCategory = await firstValueFrom(
        this.adminClient.send<any>(
          'get_contest_category_by_id',
          contest.contest_type_id,
        ),
      );

      if (!contestCategory) {
        contestRes.contest_type_id = null;
      } else {
        contestRes.contest_category = contestCategory;
        delete contestRes.contest_type_id;
      }
      if (!contestRes.social_links) {
        contestRes.social_links = null;
      } else {
        contestRes.social_links = JSON.parse(contestRes.social_links);
      }

      const contestIndustry = await firstValueFrom(
        this.adminClient.send<any>(
          'get_basic_type_ids',
          JSON.stringify(contest.industry),
        ),
      );

      if (contestIndustry.length > 0) {
        contestRes.industry = contestIndustry;
      } else {
        contestRes.industry = [];
      }

      const contestTeach = await firstValueFrom(
        this.adminClient.send<any>(
          'get_basic_type_ids',
          JSON.stringify(contest.tech),
        ),
      );
      if (contestTeach.length > 0) {
        contestRes.tech = contestTeach;
      } else {
        contestRes.tech = [];
      }

      const contestGoals = await firstValueFrom(
        this.adminClient.send<any>(
          'get_goal_by_ids',
          JSON.stringify(contest.goals),
        ),
      );
      if (contestGoals.length > 0) {
        contestRes.goals = contestGoals;
      } else {
        contestRes.goals = [];
      }

      if (
        contest.contest_customer_info &&
        contest.contest_customer_info.partners.length
      ) {
        const partners = [];
        for (
          let i = 0;
          i < contest.contest_customer_info.partners.length;
          i++
        ) {
          const getPartner = await firstValueFrom(
            this.userClient.send(
              'get_partner_by_id',
              contest.contest_customer_info.partners[i],
            ),
          );
          partners.push(getPartner);
        }
        contestRes.partners = partners;
      } else {
        contestRes.partners = [];
      }
      return contestRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createCustomerIdentity(
    data: any,
    user_id: number,
    file: any,
  ): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: data.contest_id,
        },
      });
      if (!contest) {
        return { status: 500, message: 'Contest not found.' };
      }

      let company_logo;
      if (file && typeof file != 'string') {
        company_logo = await this.s3Service.uploadFile(file);
        company_logo = company_logo.Location;
      } else {
        if (file) {
          company_logo = file;
        }
      }
      const contestCreate = new ContestCustomerIdentity();
      contestCreate.contest_for_company = data.contest_for_company;
      contestCreate.company_name = data.company_name;
      contestCreate.company_address = data.company_address;
      contestCreate.partners =
        data.partners && data.partners.length > 0
          ? data.partners.split(',')
          : [];
      contestCreate.country = data.country;
      contestCreate.state = data.state;
      contestCreate.postcode = data.postcode;
      contestCreate.company_website = data.company_website;
      contestCreate.company_logo = company_logo;
      contestCreate.right_to_organize_contest = data.right_to_organize_contest;
      contestCreate.contest = contest;
      contestCreate.created_by = user_id;
      const cci =
        await this.contestCustomerIdentityRepository.save(contestCreate);

      await this.contestRepository.update(data.contest_id, {
        contest_customer_info: cci,
      });
      const contestCoOrganizer = data.contest_coorganizer.split(',');
      if (contestCoOrganizer && contestCoOrganizer.length > 0) {
        for (let i = 0; i < contestCoOrganizer.length; i++) {
          const coOrganizer = new ContestCoOrganizer();
          coOrganizer.contest_customer_identity = cci;
          coOrganizer.created_by = user_id;
          coOrganizer.email = contestCoOrganizer[i];

          await this.contestCoOrganizerRepository.save(coOrganizer);
          const invitedByUser = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(user_id),
            }),
          );

          const invitedUser = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(user_id),
            }),
          );
          const userSetting = await this.getUserSetting(Number(invitedUser.id));
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
            }
          }
          if (sentNotification == true) {
            const admin_notification = await firstValueFrom(
              this.adminClient.send<any>(
                'get_notification_by_type',
                'CONTEST_CO_ORGANIZER_INVITE',
              ),
            );
            const joinRequestNotification = {
              title: admin_notification.notification_title
                .replace('*contest name*', contest.title)
                .replace(
                  '*user name*',
                  invitedByUser.general_profile.first_name,
                ),
              content: admin_notification.notification_content
                .replace('*contest name*', contest.title)
                .replace(
                  '*user name*',
                  invitedByUser.general_profile.first_name,
                ),
              type: admin_notification.notification_type,
              notification_from: user_id,
              notification_to: invitedUser.id,
              payload: contestCreate,
            };

            await firstValueFrom(
              this.notificationClient.send<any>(
                'create_notification',
                JSON.stringify(joinRequestNotification),
              ),
            );
          }
          if (sentMail) {
            //TODO: send email to co-organizer
            if (invitedByUser.general_profile) {
              const payload: IMailPayload = {
                template: 'INVITE_CO_ORGANIZER',
                payload: {
                  emails: [coOrganizer.email],
                  data: {
                    // title: `You've been invited to be a co-organizer for the ${contest.title} contest on Hubbers`,
                    // name: `${communityHost.general_profile.first_name}`,
                    invited_by: `${invitedByUser.general_profile.first_name} ${invitedByUser.general_profile.last_name}`,
                    contest: `${contest.title}`,
                    link: `${this.configService.get<string>(
                      'contest_join_request_url',
                    )}/${contest.id}/requests`,
                  },
                  subject: `You got request from ${invitedByUser.general_profile.first_name} to join ${contest.title} at hubbers`,
                },
              };
              this.mailClient.emit('send_email', payload);
            }
          }
        }
      }

      return contestCreate;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCustomerIdentity(
    id: number,
    data: any,
    user_id: number,
    file: any,
  ): Promise<any> {
    try {
      let current_user_organizer = null;
      if (user_id && user_id != 0) {
        const current_user = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: user_id,
          }),
        );
        const contestInfo = await this.contestRepository.findOne({
          where: {
            id: id,
          },
          relations: ['contest_customer_info'],
        });
        if (contestInfo.contest_customer_info) {
          current_user_organizer =
            await this.contestCoOrganizerRepository.findOne({
              where: {
                email: current_user.email,
                contest_customer_identity: {
                  id: contestInfo.contest_customer_info.id,
                },
              },
            });
        }
      }
      const where =
        user_id === 0 || (current_user_organizer && current_user_organizer.id)
          ? {
              contest: {
                id: id,
              },
            }
          : {
              contest: {
                id: id,
              },
              created_by: In([user_id, 0]),
            };

      const contestCustomerIdentity =
        await this.contestCustomerIdentityRepository.findOne({
          where: where,
          relations: ['contest_coorganizer'],
        });

      if (!contestCustomerIdentity) {
        return {
          status: 500,
          message: 'Contest Customer Identity Not Found',
        };
      }
      let company_logo;
      if (file) {
        if (typeof file != 'string') {
          company_logo = await this.s3Service.uploadFile(file);
          data.company_logo = company_logo.Location;
        } else {
          company_logo = file;
          data.company_logo = company_logo;
        }
      }

      if (data.contest_coorganizer && data.contest_coorganizer.length > 0) {
        const contest_coorganizer = data.contest_coorganizer.split(',');
        if (contest_coorganizer && contest_coorganizer.length > 0) {
          const contest = await this.contestRepository.findOne({
            where: {
              id: id,
            },
          });
          await this.contestCoOrganizerRepository.delete({
            contest_customer_identity: {
              id: contestCustomerIdentity.id,
            },
          });
          for (let i = 0; i < contest_coorganizer.length; i++) {
            const coOrganizer = new ContestCoOrganizer();
            coOrganizer.contest_customer_identity = contestCustomerIdentity;
            coOrganizer.created_by = user_id;
            coOrganizer.email = contest_coorganizer[i];

            await this.contestCoOrganizerRepository.save(coOrganizer);
            const invitedByUser = await firstValueFrom(
              this.userClient.send<any>('get_user_by_id', {
                userId: Number(user_id),
              }),
            );
            const invitedUser = await firstValueFrom(
              this.userClient.send<any>('get_user_by_email', {
                email: contest_coorganizer[i],
              }),
            );
            const userSetting = await this.getUserSetting(
              Number(invitedUser.id),
            );
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
              }
            }
            if (user_id === 0) {
              if (sentNotification == true) {
                const admin_notification = await firstValueFrom(
                  this.adminClient.send<any>(
                    'get_notification_by_type',
                    'CONTEST_CO_ORGANIZER_INVITE',
                  ),
                );
                const joinRequestNotification = {
                  title: admin_notification.notification_title
                    .replace('*contest name*', contest.title)
                    .replace(
                      '*user name*',
                      invitedByUser.general_profile.first_name,
                    ),
                  content: admin_notification.notification_content
                    .replace('*contest name*', contest.title)
                    .replace(
                      '*user name*',
                      invitedByUser.general_profile.first_name,
                    ),
                  type: admin_notification.notification_type,
                  notification_from: user_id,
                  notification_to: invitedUser.id,
                  payload: contest,
                };

                await firstValueFrom(
                  this.notificationClient.send<any>(
                    'create_notification',
                    JSON.stringify(joinRequestNotification),
                  ),
                );
              }
              if (sentMail) {
                //TODO: send email to co-organizer
                if (invitedByUser.general_profile) {
                  const payload: IMailPayload = {
                    template: 'INVITE_CO_ORGANIZER',
                    payload: {
                      emails: [coOrganizer.email],
                      data: {
                        // title: `You've been invited to be a co-organizer for the ${contest.title} contest on Hubbers`,
                        // name: `${communityHost.general_profile.first_name}`,
                        invited_by: 0,
                        contest: `${contest.title}`,
                        link: `${this.configService.get<string>(
                          'contest_join_request_url',
                        )}/${contest.id}/requests`,
                      },
                      subject: `You got request from hubber team to join ${contest.title} at hubbers`,
                    },
                  };
                  this.mailClient.emit('send_email', payload);
                }
              }
            }
            if (sentNotification == true && user_id > 0) {
              const admin_notification = await firstValueFrom(
                this.adminClient.send<any>(
                  'get_notification_by_type',
                  'CONTEST_CO_ORGANIZER_INVITE',
                ),
              );
              const joinRequestNotification = {
                title: admin_notification.notification_title
                  .replace('*contest name*', contest.title)
                  .replace(
                    '*user name*',
                    invitedByUser.general_profile.first_name,
                  ),
                content: admin_notification.notification_content
                  .replace('*contest name*', contest.title)
                  .replace(
                    '*user name*',
                    invitedByUser.general_profile.first_name,
                  ),
                type: admin_notification.notification_type,
                notification_from: user_id,
                notification_to: invitedUser.id,
                payload: contest,
              };

              await firstValueFrom(
                this.notificationClient.send<any>(
                  'create_notification',
                  JSON.stringify(joinRequestNotification),
                ),
              );
            }
            if (sentMail) {
              //TODO: send email to co-organizer
              if (invitedByUser.general_profile) {
                const payload: IMailPayload = {
                  template: 'INVITE_CO_ORGANIZER',
                  payload: {
                    emails: [coOrganizer.email],
                    data: {
                      // title: `You've been invited to be a co-organizer for the ${contest.title} contest on Hubbers`,
                      // name: `${communityHost.general_profile.first_name}`,
                      invited_by: `${invitedByUser.general_profile.first_name} ${invitedByUser.general_profile.last_name}`,
                      contest: `${contest.title}`,
                      link: `${this.configService.get<string>(
                        'contest_join_request_url',
                      )}/${contest.id}/requests`,
                    },
                    subject: `You got request from ${invitedByUser.general_profile.first_name} to join ${contest.title} at hubbers`,
                  },
                };
                this.mailClient.emit('send_email', payload);
              }
            }
          }
        }
      }
      if (!data.contest_coorganizer) {
        for (
          let i = 0;
          i < contestCustomerIdentity.contest_coorganizer.length;
          i++
        ) {
          await this.contestCoOrganizerRepository.delete({
            id: contestCustomerIdentity.contest_coorganizer[i].id,
          });
        }
      }
      delete data.contest_coorganizer;
      data.partners =
        data.partners && data.partners.length > 0
          ? data.partners.split(',')
          : [];
      await this.contestCustomerIdentityRepository.update(
        contestCustomerIdentity.id,
        data,
      );
      return {
        status: 200,
        message: 'Contest Customer Identity updated',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestCustomerIdentity(id: number): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: id,
        },
        relations: ['contest_customer_info'],
      });
      if (!contest) {
        throw new HttpException(
          'CONTEST_CUSTOMER_IDENTITY_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return contest.contest_customer_info;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createContestCriteria(
    data: CreateContestCriteriaDto,
    user_id: number,
  ): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: data.contest_id,
        },
      });
      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const criteriaCreated = new ContestCriteria();
      criteriaCreated.contest_description = data.contest_description;
      criteriaCreated.own_criteria = data.own_criteria;
      criteriaCreated.created_by = user_id;
      criteriaCreated.contest = contest;

      const cc = await this.contestCriteriaRepository.save(criteriaCreated);
      if (data.contest_prizes.length > 0) {
        for (let i = 0; i < data.contest_prizes.length; i++) {
          const contestPrize = new ContestPrize();
          contestPrize.name = data.contest_prizes[i].name;
          contestPrize.amount = data.contest_prizes[i].amount;
          contestPrize.currency = data.contest_prizes[i].currency;
          contestPrize.royalty = data.contest_prizes[i].royalty;
          contestPrize.description = data.contest_prizes[i].description;
          contestPrize.created_by = user_id;
          contestPrize.contest_criteria = cc;

          await this.contestPrizeRepository.save(contestPrize);
        }
      }

      if (data.contest_marks.length > 0) {
        for (let i = 0; i < data.contest_marks.length; i++) {
          const contestMark = new ContestMarks();
          contestMark.mark = data.contest_marks[i].mark;
          contestMark.title = data.contest_marks[i].title;
          contestMark.created_by = user_id;
          contestMark.contest_criteria = cc;

          await this.contestMarksRepository.save(contestMark);
        }
      }

      if (data.contest_own_criteria.length > 0) {
        for (let i = 0; i < data.contest_own_criteria.length; i++) {
          const contestOwnCriteria = new ContestOwnCriteria();
          contestOwnCriteria.weightage = data.contest_own_criteria[i].weightage;
          contestOwnCriteria.title = data.contest_own_criteria[i].title;
          contestOwnCriteria.description =
            data.contest_own_criteria[i].description;
          contestOwnCriteria.created_by = user_id;
          contestOwnCriteria.contest_criteria = cc;
          await this.contestOwnCriteriaRepository.save(contestOwnCriteria);
        }
      }

      await this.contestRepository.update(data.contest_id, {
        contest_criteria: cc,
      });
      const res = await this.contestCriteriaRepository.findOne({
        where: {
          id: criteriaCreated.id,
        },
        relations: [
          'contest_marks',
          'contest_prizes',
          'contest',
          'contest_own_criteria',
        ],
      });
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateContestCriteria(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    const where =
      user_id === 0
        ? {
            id,
            contest: {
              id: data.contest_id,
            },
          }
        : {
            id,
            contest: {
              id: data.contest_id,
            },
          };

    const contestCriteria = await this.contestCriteriaRepository.findOne({
      where: { ...where },
    });

    if (!contestCriteria) {
      return {
        status: 500,
        message: 'CONTEST_CRITERIA_NOT_FOUND',
      };
    }

    await this.contestCriteriaRepository.update(id, {
      contest_description: data.contest_description,
      own_criteria: data.own_criteria,
    });

    if (data.contest_prizes && data.contest_prizes.length > 0) {
      await this.contestPrizeRepository.delete({
        contest_criteria: {
          id: id,
        },
      });

      for (let i = 0; i < data.contest_prizes.length; i++) {
        const contestPrize = new ContestPrize();
        contestPrize.name = data.contest_prizes[i].name;
        contestPrize.amount = data.contest_prizes[i].amount;
        contestPrize.currency = data.contest_prizes[i].currency;
        contestPrize.royalty = data.contest_prizes[i].royalty;
        contestPrize.description = data.contest_prizes[i].description;
        contestPrize.created_by = user_id;
        contestPrize.contest_criteria = contestCriteria;

        await this.contestPrizeRepository.save(contestPrize);
      }
    }

    if (data.contest_marks && data.contest_marks.length > 0) {
      await this.contestMarksRepository.delete({
        contest_criteria: {
          id: id,
        },
      });

      for (let i = 0; i < data.contest_marks.length; i++) {
        const contestMark = new ContestMarks();
        contestMark.mark = data.contest_marks[i].mark;
        contestMark.title = data.contest_marks[i].title;
        contestMark.created_by = user_id;
        contestMark.contest_criteria = contestCriteria;

        await this.contestMarksRepository.save(contestMark);
      }
    }

    if (data.contest_own_criteria && data.contest_own_criteria.length > 0) {
      await this.contestOwnCriteriaRepository.delete({
        contest_criteria: {
          id: id,
        },
      });

      for (let i = 0; i < data.contest_own_criteria.length; i++) {
        const contestOwnCriteria = new ContestOwnCriteria();
        contestOwnCriteria.weightage = data.contest_own_criteria[i].weightage;
        contestOwnCriteria.title = data.contest_own_criteria[i].title;
        contestOwnCriteria.description =
          data.contest_own_criteria[i].description;
        contestOwnCriteria.created_by = user_id;
        contestOwnCriteria.contest_criteria = contestCriteria;

        await this.contestOwnCriteriaRepository.save(contestOwnCriteria);
      }
    }

    return {
      status: 200,
      message: 'Customer criteria updated successfully',
    };
  }

  public async getContestCriteria(id: number): Promise<any> {
    try {
      const contestCriteria = await this.contestCriteriaRepository.findOne({
        where: {
          id: id,
        },
        relations: [
          'contest_prizes',
          'contest_marks',
          'contest',
          'contest_own_criteria',
        ],
      });
      if (!contestCriteria) {
        throw new HttpException(
          'CONTEST_CRITERIA_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return contestCriteria;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createContestRules(
    data: CreateContestRuleDto,
    user_id: number,
  ): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: data.contest_id,
        },
      });
      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const contestRule = new ContestRules();
      contestRule.attachments = data.attachments;
      contestRule.contest = contest;
      contestRule.contest_rules = data.contest_rules;
      contestRule.other_description = data.other_description;
      contestRule.created_by = user_id;

      const contestR = await this.contestRulesRepository.save(contestRule);

      await this.contestRepository.update(data.contest_id, {
        contest_rules: contestR,
        contest_state: CONTEST_STATE.PENDING,
      });

      return contestRule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateContestRule(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id === 0
          ? {
              id,
              contest: {
                id: data.contest_id,
              },
            }
          : {
              id,
              contest: {
                id: data.contest_id,
              },
            };
      const contestRules = await this.contestRulesRepository.findOne({
        where: where,
      });

      if (!contestRules) {
        throw new HttpException(
          'CONTEST_RULES_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      delete data.contest_id;
      await this.contestRulesRepository.update(id, data);

      return {
        status: 200,
        message: 'Contest Rules updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestRules(id: number): Promise<any> {
    try {
      const contestRules = await this.contestRulesRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!contestRules) {
        throw new HttpException(
          'CONTEST_RULES_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return contestRules;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestByState(data: any, user_id: number): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const newD = {
        take: data.limit,
        skip,
      };
      const whereConn: any = {
        id: [],
      };
      if (data.state != 'ALL') {
        whereConn.contest_state = data.state;
      }

      if (data.contest_role && user_id) {
        if (data.contest_role == 'ORGANIZER' || data.contest_role == 'ALL') {
          const userContest = await this.contestRepository.find({
            where: {
              created_by: user_id,
            },
          });
          const contestIds = await this.arrayColumn(userContest, 'id');
          const userDetails = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: user_id,
            }),
          );
          const co_organize_by = await this.contestCoOrganizerRepository.find({
            where: {
              email: Like(userDetails.email),
            },
            relations: [
              'contest_customer_identity',
              'contest_customer_identity.contest',
            ],
          });
          for (let i = 0; i < co_organize_by.length; i++) {
            if (
              co_organize_by[i].contest_customer_identity &&
              co_organize_by[i].contest_customer_identity.contest
            ) {
              contestIds.push(
                co_organize_by[i].contest_customer_identity.contest.id,
              );
            }
          }
          if (contestIds.length) {
            whereConn.id = [...contestIds];
          }
        }
        if (data.contest_role != 'ORGANIZER' || data.contest_role == 'ALL') {
          let whereConnIn: any = {
            role: data.contest_role,
            created_by: user_id,
            status: CONTESTANT_STATUS.ACCEPTED,
          };
          if (data.contest_role == 'ALL') {
            whereConnIn = {
              created_by: user_id,
              status: CONTESTANT_STATUS.ACCEPTED,
            };
          }
          const contestant = await this.contestContestantRepository.find({
            where: { ...whereConnIn },
            relations: ['contest'],
          });
          const contestList = await this.arrayColumn(contestant, 'contest');
          const contestIDS = await this.arrayColumn(contestList, 'id');
          whereConn.id = [...whereConn.id, ...contestIDS];
        }
      }
      if (data.name) {
        whereConn.title = ILike(`%${data.name}%`);
      }
      if (whereConn.id.length) {
        whereConn.id = In([...whereConn.id]);
      } else {
        delete whereConn.id;
      }
      const contest = await this.contestRepository.find({
        relations: [
          'contest_customer_info',
          'contest_customer_info.contest_coorganizer',
          'contest_criteria',
          'contest_rules',
          'contestant',
          'contest_submissions',
          'contest_submissions.submission_review',
        ],
        order: {
          id: 'DESC',
        },
        take: newD.take,
        skip: newD.skip,
        where: whereConn,
      });
      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const contestRes: any = contest;
      for (let i = 0; i < contest.length; i++) {
        const judgeCount = await this.contestContestantRepository.count({
          where: {
            status: CONTESTANT_STATUS.ACCEPTED,
            role: CONTESTANT_ROLE.JUDGE,
            contest: {
              id: contest[i].id,
            },
          },
        });
        const contestantCount = await this.contestContestantRepository.count({
          where: {
            status: CONTESTANT_STATUS.ACCEPTED,
            role: CONTESTANT_ROLE.CONTESTANT,
            contest: {
              id: contest[i].id,
            },
          },
        });
        contestRes[i].contestant_count = contestantCount;
        contestRes[i].judge_count = judgeCount;
        const contestCategory = await firstValueFrom(
          this.adminClient.send<any>(
            'get_contest_category_by_id',
            contest[i].contest_type_id,
          ),
        );

        if (!contestCategory) {
          contestRes[i].contest_type_id = null;
        } else {
          contestRes[i].contest_category = contestCategory;
          delete contestRes[i].contest_type_id;
        }

        const contestIndustry = await firstValueFrom(
          this.adminClient.send<any>(
            'get_basic_type_ids',
            JSON.stringify(contest[i].industry),
          ),
        );

        if (contestIndustry.length > 0) {
          contestRes[i].industry = contestIndustry;
        } else {
          contestRes[i].industry = [];
        }

        const contestTeach = await firstValueFrom(
          this.adminClient.send<any>(
            'get_basic_type_ids',
            JSON.stringify(contest[i].tech),
          ),
        );

        if (contestTeach.length > 0) {
          contestRes[i].tech = contestTeach;
        } else {
          contestRes[i].tech = [];
        }

        const contestGoals = await firstValueFrom(
          this.adminClient.send<any>(
            'get_goal_by_ids',
            JSON.stringify(contest[i].goals),
          ),
        );

        if (contestGoals.length > 0) {
          contestRes[i].goals = contestGoals;
        } else {
          contestRes[i].goals = [];
        }

        if (Number(contestRes[i].created_by) > 0) {
          const createdBy = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(contestRes[i].created_by),
            }),
          );

          delete createdBy.password;
          delete createdBy.verification_code;
          delete createdBy.reset_password_otp;
          delete createdBy.linkedin_id;
          delete createdBy.is_login_with_linkedin;

          if (createdBy) {
            contestRes[i].contest_created_by = createdBy;
          }

          if (
            contest[i].contestant &&
            contest[i].contestant.length > 0 &&
            user_id
          ) {
            const currentUser = this.findObject(
              contest[i].contestant,
              user_id,
              'val',
            );

            if (currentUser) {
              contestRes[i].current_user_status = currentUser;
            }
          } else {
            contestRes[i].current_user_status = [];
          }
        }
      }
      const total = await this.contestRepository.count({
        where: whereConn,
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: contestRes,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async joinContest(data: JoinContest, user_id: number): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: data.contest_id,
        },
      });
      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const checkContestant = await this.contestContestantRepository.findOne({
        where: {
          contest: {
            id: contest.id,
          },
          created_by: user_id,
          status: Not(CONTESTANT_STATUS.REJECTED),
        },
      });

      if (checkContestant && checkContestant.id) {
        return {
          status: 500,
          message: `You already apply for ${data.role.toLocaleLowerCase()}`,
        };
      }
      const contestant = new ContestContestant();
      contestant.created_by = user_id;
      contestant.role = data.role;
      contestant.contest = contest;
      contestant.status =
        contest.created_by == user_id
          ? CONTESTANT_STATUS.ACCEPTED
          : CONTESTANT_STATUS.PENDING;
      contestant.time_of_accepted = new Date().toISOString();
      const saveContestant =
        await this.contestContestantRepository.save(contestant);

      const invitedUser = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(user_id),
        }),
      );
      const contestHost = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(contest.created_by),
        }),
      );

      if (saveContestant && data.role == CONTESTANT_ROLE.CONTESTANT) {
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'CONTEST_CONTESTANT_JOIN_REQUEST',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title.replace(
            '*user*',
            invitedUser.general_profile.first_name,
          ),
          content: admin_notification.notification_content.replace(
            '*user*',
            invitedUser.general_profile.first_name,
          ),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: contest.created_by,
          payload: contestant,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );
        const payload: IMailPayload = {
          template: 'CONTEST_CONTESTANT_JOIN_REQUEST',
          payload: {
            emails: [contestHost.email],
            data: {
              host_name: contestHost
                ? contestHost.general_profile.first_name
                : '',
              contest_name: contest.title,
              user_name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
              link: `${this.configService.get<string>(
                'contest_join_request_url',
              )}/${contest.id}/requests/contestant-request/requestId=${
                contestant.id
              }`,
            },
            subject: `A new contestant wants to join your contest`,
          },
        };

        this.mailClient.emit('send_email', payload);
      }
      if (saveContestant && data.role == CONTESTANT_ROLE.JUDGE) {
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'CONTEST_JUDGE_JOIN_REQUEST',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*contest name*', contest.title),
          content: admin_notification.notification_content
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*contest name*', contest.title),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: contest.created_by,
          payload: contestant,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );
        const payload: IMailPayload = {
          template: 'CONTEST_JUDGE_JOIN_REQUEST',
          payload: {
            emails: [contestHost.email],
            data: {
              host_name: contestHost
                ? contestHost.general_profile.first_name
                : '',
              contest_name: contest.title,
              user_name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
              link: `${this.configService.get<string>(
                'contest_join_request_url',
              )}/${contest.id}/requests/judge-request/requestId=${
                contestant.id
              }`,
            },
            subject: `A new judge wants to join your contest`,
          },
        };

        this.mailClient.emit('send_email', payload);
      }

      return {
        status: 200,
        message: `Successfully apply for ${data.role.toLocaleLowerCase()}`,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getContestant(
    contest_id: number,
    status: string,
    role: string,
  ): Promise<any> {
    try {
      const whereCondition: any = {};
      if (contest_id != 0) {
        whereCondition.where = {
          contest: { id: contest_id },
        };
      } else {
        whereCondition.where = {};
      }
      if (role != 'ALL') {
        whereCondition.where['role'] = CONTESTANT_ROLE[role];
      }
      if (status != 'ALL') {
        whereCondition.where['status'] = CONTESTANT_STATUS[status];
      }
      const contestant = await this.contestContestantRepository.find({
        ...whereCondition,
        relations: ['contest'],
      });
      if (contestant) {
        for (let i = 0; i < contestant.length; i++) {
          contestant[i].created_by = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(contestant[i].created_by),
            }),
          );
        }
      }
      return contestant;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getUserContestant(
    contest_id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const where: any = {};
      const responseContestant = [];
      if (data.role != 'ALL') {
        where.role = data.role;
      }
      if (data.status != 'ALL') {
        where.status = data.status;
      }
      if (contest_id) {
        where.contest = {
          id: contest_id,
        };
      } else {
        const contest = await this.contestRepository.find({
          where: {
            created_by: user_id,
          },
        });
        if (!contest.length) {
          return {
            status: 500,
            message: 'No contest found.',
          };
        }
        const contest_id = await this.arrayColumn(contest, 'id');
        where.contest = {
          id: In(contest_id),
        };
      }
      const contestant: any = await this.contestContestantRepository.find({
        where: {
          ...where,
        },
        take: data.limit,
        skip: skip,
        relations: ['contest'],
      });
      for (let j = 0; j < contestant.length; j++) {
        const createdBy = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: contestant[j].created_by,
          }),
        );
        contestant[j].created_by = createdBy;
        if (contest_id && data.role == CONTESTANT_ROLE.CONTESTANT && user_id) {
          const countContestantSubmission =
            await this.contestSubmissionRepository.count({
              where: {
                contestant: contestant[j],
                contest: contestant[j].contest,
              },
            });
          contestant[j].no_of_submission = countContestantSubmission;
        }
        if (contest_id && data.role == CONTESTANT_ROLE.JUDGE && user_id) {
          const countJudgeReview =
            await this.contestSubmissionReviewRepository.count({
              where: {
                judge: contestant[j],
                contest: contestant[j].contest,
              },
            });
          contestant[j].no_of_review = countJudgeReview;
        }
      }
      responseContestant.push(...contestant);
      const total = await this.contestContestantRepository.count({
        where: { ...where },
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: responseContestant,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async removeContestant(id: number): Promise<any> {
    try {
      const contest = await this.contestContestantRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!contest) {
        return {
          status: 500,
          message: 'No Contest Contestant found.',
        };
      }
      await this.contestContestantRepository.delete(id);
      return {
        status: 200,
        message: `Contest ${contest.role.toLocaleLowerCase()} Removed successfully.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContest(data: any): Promise<any> {
    try {
      const contest = await this.contestRepository
        .createQueryBuilder('contest')
        .where('contest.contest_state != :contest_state', {
          contest_state: CONTEST_STATE.DRAFTED,
        })
        .orderBy('contest.id', 'DESC')
        .take(data.take)
        .skip(data.skip)
        .getMany();

      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return contest;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getContestAllDetails(
    user_id: number,
    contest_id: number,
  ): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: contest_id,
        },
        relations: [
          'contest_customer_info',
          'contest_customer_info.contest_coorganizer',
          'contest_criteria',
          'contest_rules',
          'contestant',
          'contest_submissions',
          'contest_submissions.submission_review',
          'reaction',
        ],
      });

      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const contestRes: any = contest;
      const createdBy = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: contest.created_by,
        }),
      );
      delete createdBy.password;
      delete createdBy.verification_code;
      delete createdBy.reset_password_otp;
      delete createdBy.linkedin_id;
      delete createdBy.is_login_with_linkedin;
      contestRes.organize_by = createdBy;
      const contestCategory = await firstValueFrom(
        this.adminClient.send<any>(
          'get_contest_category_by_id',
          contest.contest_type_id,
        ),
      );

      if (!contestCategory) {
        contestRes.contest_type_id = null;
      } else {
        contestRes.contest_category = contestCategory;
        // delete contestRes.contest_type_id;
      }

      if (contest.contest_criteria) {
        const pm = await this.contestCriteriaRepository.findOne({
          where: {
            id: contest.contest_criteria.id,
          },
          relations: [
            'contest_marks',
            'contest_prizes',
            'contest_prizes.claim_prize',
            'contest_own_criteria',
          ],
        });

        if (!pm) {
          contestRes.contest_marks = [];
          contestRes.contest_prizes = [];
        } else {
          contestRes.contest_criteria = pm;
          delete contestRes.contest_marks;
          delete contestRes.contest_prizes;
        }
        if (contest.reaction && contest.reaction.length > 0) {
          const currentUser = this.findObjectUserId(
            contest.reaction,
            user_id,
            'val',
          );
          if (currentUser) {
            contestRes.reaction_status = currentUser.reaction;
          }
        } else {
          contestRes.reaction_status = '';
        }
      }

      const organizer = await this.contestCustomerIdentityRepository.find({
        where: {
          contest: {
            id: contest.id,
          },
        },
        relations: ['contest_coorganizer'],
      });
      const userDetails = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: user_id,
        }),
      );
      delete userDetails.password;
      delete userDetails.verification_code;
      delete userDetails.reset_password_otp;
      delete userDetails.linkedin_id;
      delete userDetails.is_login_with_linkedin;

      const is_co_organizer = false;
      const coOrganizer = [];
      if (organizer.length) {
        for (let i = 0; i < organizer.length; i++) {
          for (let j = 0; j < organizer[i].contest_coorganizer.length; j++) {
            contestRes.co_organize_by = organizer[i].contest_coorganizer[j];
            const organizerUser = await firstValueFrom(
              this.userClient.send('get_user_by_email', {
                email: contestRes.co_organize_by.email,
              }),
            );
            delete organizerUser.password;
            delete organizerUser.verification_code;
            delete organizerUser.reset_password_otp;
            delete organizerUser.linkedin_id;
            delete organizerUser.is_login_with_linkedin;
            contestRes.co_organize_by.created_by = organizerUser;
            if (
              contestRes.co_organize_by.email == userDetails.email &&
              is_co_organizer == false
            ) {
              contestRes.co_organize_by.is_co_organizer = true;
            } else {
              contestRes.co_organize_by.is_co_organizer = false;
            }
            coOrganizer.push(contestRes.co_organize_by);
          }
        }
      } else {
        contestRes.co_organize_by = [];
        contestRes.is_co_organizer = false;
      }
      contestRes.co_organize_by = coOrganizer;

      const contestIndustry = await firstValueFrom(
        this.adminClient.send<any>(
          'get_basic_type_ids',
          JSON.stringify(contest.industry),
        ),
      );

      if (contestIndustry.length > 0) {
        contestRes.industry = contestIndustry;
      } else {
        contestRes.industry = [];
      }

      const contestTeach = await firstValueFrom(
        this.adminClient.send<any>(
          'get_basic_type_ids',
          JSON.stringify(contest.tech),
        ),
      );
      if (contestTeach.length > 0) {
        contestRes.tech = contestTeach;
      } else {
        contestRes.tech = [];
      }

      const contestGoals = await firstValueFrom(
        this.adminClient.send<any>(
          'get_goal_by_ids',
          JSON.stringify(contest.goals),
        ),
      );

      if (contestGoals.length > 0) {
        contestRes.goals = contestGoals;
      } else {
        contestRes.goals = [];
      }

      contestRes.is_organizer =
        Number(contest.created_by) === user_id ? true : false;

      if (contest.created_by > 0) {
        const createdBy = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: contest.created_by,
          }),
        );

        delete createdBy.password;
        delete createdBy.verification_code;
        delete createdBy.reset_password_otp;
        delete createdBy.linkedin_id;
        delete createdBy.is_login_with_linkedin;

        if (createdBy) {
          contestRes.created_by = createdBy;
        }

        if (contest.contestant && contest.contestant.length > 0) {
          const currentUser = this.findObject(
            contest.contestant,
            user_id,
            'val',
          );

          if (currentUser) {
            contestRes.current_user_status = currentUser;
          }
        } else {
          contestRes.current_user_status = [];
        }
      }
      const partners = [];
      if (
        contest.contest_customer_info &&
        contest.contest_customer_info.partners &&
        contest.contest_customer_info.partners.length
      ) {
        for (
          let i = 0;
          i < contest.contest_customer_info.partners.length;
          i++
        ) {
          const getPartner = await firstValueFrom(
            this.userClient.send(
              'get_partner_by_id',
              contest.contest_customer_info.partners[i],
            ),
          );
          partners.push(getPartner);
        }
        contestRes.contest_customer_info.partners = partners;
      }

      if (contest && contest.id) {
        const getPartner = await firstValueFrom(
          this.userClient.send('get_partner_by_contest_id', contest.id),
        );
        contestRes.partners = getPartner;
      } else {
        contestRes.partners = [];
      }

      return contestRes;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  private findObject(arr, value, return_type) {
    const element = arr.find((val) => {
      return Number(val.created_by) === Number(value);
    });

    if (return_type === 'bool') {
      return typeof element === 'undefined' ? false : true;
    } else {
      return element;
    }
  }
  private findObjectUserId(arr, value, return_type) {
    const element = arr.find((val) => {
      return Number(val.user_id) === Number(value);
    });

    if (return_type === 'bool') {
      return typeof element === 'undefined' ? false : true;
    } else {
      return element;
    }
  }

  public async deleteContest(
    user_id: number,
    contest_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id === 0
          ? { id: contest_id }
          : { id: contest_id, created_by: user_id };

      const contest = await this.contestRepository.findOne({
        where: where,
      });

      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.contestRepository.delete(contest_id);

      return {
        status: 200,
        message: 'Contest Deleted successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getPopularContests(data: any, user_id: number): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const contests = await this.contestRepository
        .createQueryBuilder('contest')
        .leftJoinAndSelect('contest.contestant', 'contestants')
        .leftJoinAndSelect(
          'contest.contest_customer_info',
          'contest_customer_info',
        )
        .leftJoinAndSelect(
          'contest_customer_info.contest_coorganizer',
          'contest_coorganizer',
        )
        .where('contest.contest_state = :contest_state', {
          contest_state: CONTEST_STATE.COMPLETED || CONTEST_STATE.ONGOING,
        })
        .orderBy('contestants.id', 'DESC')
        .skip(skip)
        .take(data.limit)
        .getMany();

      const contestRes: any = [...contests];
      for (let i = 0; i < contestRes.length; i++) {
        if (Number(contestRes[i].created_by) > 0) {
          const createdBy = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(contestRes[i].created_by),
            }),
          );

          delete createdBy.password;
          delete createdBy.verification_code;
          delete createdBy.reset_password_otp;
          delete createdBy.linkedin_id;
          delete createdBy.is_login_with_linkedin;

          if (createdBy) {
            contestRes[i].contest_created_by = createdBy;
          }

          if (
            contests[i].contestant &&
            contests[i].contestant.length > 0 &&
            user_id > 0
          ) {
            const currentUser = this.findObject(
              contests[i].contestant,
              user_id,
              'val',
            );

            if (currentUser) {
              contestRes[i].current_user_status = currentUser;
            }
          } else {
            contestRes[i].current_user_status = [];
          }
        }
      }
      return contestRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }
  public async searchContests(
    data: SearchWithPaginationDto,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      let contest: any = [];
      const condition: any = {
        where: {
          contest_state: In([CONTEST_STATE.COMPLETED, CONTEST_STATE.ONGOING]),
        },
        take: data.limit,
        skip: skip,
      };
      if (data.contest_category) {
        condition.where.contest_type_id = data.contest_category;
      }
      if (data.contest_filter == 'JUST_ADDED') {
        condition.order = {
          created_by: 'DESC',
        };
      }
      if (data.contest_filter == 'CONTESTS_APPLIED') {
        const enroll = await this.contestContestantRepository
          .query(`SELECT contest_id , COUNT(contest_id) as total
      FROM contest_contestant
      GROUP BY contest_id 
      ORDER BY total DESC
      `);
        const contest_ids = await this.arrayColumn(enroll, 'contest_id');
        condition.where.id = In(contest_ids);
      }

      if (data.contest_filter == 'TRENDING') {
        const enroll = await this.contestContestantRepository
          .query(`SELECT contest_id , COUNT(contest_id) as total
      FROM contest_contestant
      GROUP BY contest_id 
      ORDER BY total DESC
      `);
        const contest_ids = await this.arrayColumn(enroll, 'contest_id');
        condition.where.id = In(contest_ids);
      }

      if (data.contest_filter == 'MOST_POPULAR') {
        const enroll = await this.contestContestantRepository
          .query(`SELECT contest_id , COUNT(contest_id) as total
      FROM contest_reaction
      GROUP BY contest_id 
      ORDER BY total DESC
      `);
        const contest_ids = await this.arrayColumn(enroll, 'contest_id');
        condition.where.id = In(contest_ids);
      }

      if (data.contest_filter == 'SAVED_CONTESTS') {
        condition.contest_reaction = {
          created_by: user_id,
        };
      }

      if (data.contest_filter == 'MY_CONTESTS') {
        condition.where.created_by = user_id;
        delete condition.where.contest_state;
      }

      if (data.sort_by == 'PUBLIC') {
        condition.where.everyone_can_participate = 'TRUE';
        condition.order = {
          id: 'DESC',
        };
      }

      if (data.sort_by == 'PRIVATE') {
        condition.where.everyone_can_participate = 'FALSE';
        condition.order = {
          id: 'DESC',
        };
      }

      if (data.sort_by == 'DATE') {
        condition.order = {
          created_at: 'DESC',
        };
      }

      if (data.name) {
        condition.where['title'] = ILike(`%${data.name}%`);
      }

      contest = await this.contestRepository.find({
        ...condition,
        relations: ['contestant'],
      });
      const contestRes: any = [...contest];
      for (let i = 0; i < contest.length; i++) {
        if (Number(contestRes[i].created_by) > 0) {
          const createdBy = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(contestRes[i].created_by),
            }),
          );

          delete createdBy.password;
          delete createdBy.verification_code;
          delete createdBy.reset_password_otp;
          delete createdBy.linkedin_id;
          delete createdBy.is_login_with_linkedin;

          if (createdBy) {
            contestRes[i].contest_created_by = createdBy;
          }

          if (
            contest[i].contestant &&
            contest[i].contestant.length > 0 &&
            user_id > 0
          ) {
            const currentUser = this.findObject(
              contest[i].contestant,
              user_id,
              'val',
            );

            if (currentUser) {
              contestRes[i].current_user_status = currentUser;
            }
          } else {
            contestRes[i].current_user_status = [];
          }
          const contestReaction = await this.contestReactionRepository.count({
            where: {
              contest: {
                id: contest[i].id,
              },
            },
          });
          if (contestReaction) {
            contestRes[i].reaction_status = true;
          } else {
            contestRes[i].reaction_status = false;
          }
          const contestantCount = await this.contestContestantRepository.count({
            where: {
              contest: {
                id: contest[i].id,
              },
              role: CONTESTANT_ROLE.CONTESTANT,
              status: CONTESTANT_STATUS.ACCEPTED,
            },
          });
          contestRes[i].contestant_count = contestantCount;

          const judgeCount = await this.contestContestantRepository.count({
            where: {
              contest: {
                id: contest[i].id,
              },
              role: CONTESTANT_ROLE.JUDGE,
            },
          });
          contestRes[i].judge_count = judgeCount;
        }
        const organizer = await this.contestCustomerIdentityRepository.find({
          where: {
            contest: {
              id: contest[i].id,
            },
            right_to_organize_contest: YES_NO.YES,
          },
          relations: ['contest_coorganizer'],
        });

        const userDetails = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: user_id,
          }),
        );
        delete userDetails.password;
        delete userDetails.verification_code;
        delete userDetails.reset_password_otp;
        delete userDetails.linkedin_id;
        delete userDetails.is_login_with_linkedin;

        const is_co_organizer = false;
        const coOrganizer = [];
        if (organizer.length) {
          for (let j = 0; j < organizer.length; j++) {
            for (let k = 0; k < organizer[j].contest_coorganizer.length; k++) {
              contestRes[i].co_organize_by =
                organizer[j].contest_coorganizer[k];
              if (
                contestRes[i].co_organize_by.email == userDetails.email &&
                is_co_organizer == false
              ) {
                contestRes[i].co_organize_by.is_co_organizer = true;
              } else {
                contestRes[i].co_organize_by.is_co_organizer = false;
              }
              coOrganizer.push(contestRes[i].co_organize_by);
            }
          }
        } else {
          contestRes[i].co_organize_by = [];
          contestRes[i].is_co_organizer = false;
        }
        contestRes[i].co_organize_by = coOrganizer;
      }

      delete condition.skip;
      delete condition.take;
      const total = await this.contestRepository.count(condition);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: contestRes,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllSubmission(id: number): Promise<any> {
    try {
      const submission: any = await this.contestSubmissionRepository.find({
        where: {
          contest: {
            id,
          },
        },
        relations: [
          'contestant_submission_upload',
          'contestant_own_criteria_submission',
          'contestant',
          'submission_review',
          'submission_review.contest_own_criteria_submission',
          'submission_review.contest_own_criteria_submission.contest_own_criteria',
          'submission_review.contest_own_criteria_submission.contest_own_criteria.contest_criteria',
          'contestant_own_criteria_submission.contest_own_criteria',
        ],
      });

      for (let i = 0; i < submission.length; i++) {
        const contest_own_criteria: any =
          await this.contestCriteriaRepository.find({
            where: {
              contest: {
                id: id,
              },
            },
            relations: ['contest_own_criteria', 'contest_marks'],
          });

        if (submission[i].submission_review) {
          const markArr = await this.arrayColumn(
            submission[i].submission_review,
            'rating',
          );
          submission[i].average_grade = markArr.reduce(
            (partialSum, a) => Number(partialSum) + Number(a),
            0,
          );
          for (let j = 0; j < submission[i].submission_review.length; j++) {
            if (Number(submission[i].submission_review[j].created_by) > 0) {
              const createdBy = await firstValueFrom(
                this.userClient.send<any>('get_user_by_id', {
                  userId: Number(submission[i].submission_review[j].created_by),
                }),
              );
              delete createdBy.password;
              delete createdBy.verification_code;
              delete createdBy.reset_password_otp;
              delete createdBy.linkedin_id;
              delete createdBy.is_login_with_linkedin;
              submission[i].submission_review[j].created_by = createdBy;
            }
          }
        }
        submission[i].contest_criteria = contest_own_criteria;
        if (Number(submission[i].created_by) > 0) {
          const createdBy = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(submission[i].created_by),
            }),
          );
          delete createdBy.password;
          delete createdBy.verification_code;
          delete createdBy.reset_password_otp;
          delete createdBy.linkedin_id;
          delete createdBy.is_login_with_linkedin;
          submission[i].created_by = createdBy;
        }
      }
      return submission;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async deleteContestRevisionData(
    user_id: number,
    id: number,
  ): Promise<any> {
    try {
      const where =
        user_id === 0 ? { id: id } : { id: id, created_by: user_id };

      const contest = await this.contestSubmissionRepository.findOne({
        where: where,
      });

      if (!contest) {
        throw new HttpException(
          'CONTEST_REVISION_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.contestSubmissionRepository.delete(id);

      return {
        status: 200,
        message: 'Contest revision Deleted successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getAllSubmissionAdmin(): Promise<any> {
    try {
      const submission = await this.contestSubmissionRepository.find({
        relations: [
          'contest',
          'contestant_submission_upload',
          'contestant_own_criteria_submission',
          'contestant',
          'submission_review',
          'submission_review.contest_own_criteria_submission',
          'submission_review.contest_own_criteria_submission.contest_own_criteria',
          'submission_review.contest_own_criteria_submission.contest_own_criteria.contest_criteria',
          'contestant_own_criteria_submission.contest_own_criteria',
        ],
      });
      for (let i = 0; i < submission.length; i++) {
        if (Number(submission[i].created_by) > 0) {
          const createdBy = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(submission[i].created_by),
            }),
          );
          delete createdBy.password;
          delete createdBy.verification_code;
          delete createdBy.reset_password_otp;
          delete createdBy.linkedin_id;
          delete createdBy.is_login_with_linkedin;
          submission[i].created_by = createdBy;
        }
      }
      return submission;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async submitContestSubmission(
    id: number,
    data: ContestSubmissionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const contestContestant = await this.contestContestantRepository.findOne({
        where: {
          created_by: user_id,
          role: CONTESTANT_ROLE.CONTESTANT,
          contest: {
            id: contest.id,
          },
        },
      });

      if (!contestContestant) {
        throw new HttpException(
          'NOT_PART_OF_CONTEST',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const checkContestSubmission =
        await this.contestSubmissionRepository.count({
          where: {
            contestant: {
              id: contestContestant.id,
            },
          },
        });
      if (checkContestSubmission >= contest.no_of_revisions) {
        return {
          status: 500,
          message: `you have already submitted ${checkContestSubmission} revision`,
        };
      }

      const contestSubmission = new ContestSubmission();
      contestSubmission.contest = contest;
      contestSubmission.created_by = user_id;
      contestSubmission.describe_entry = data.describe_entry;
      contestSubmission.contestant = contestContestant;
      const contestSubmissionCreated =
        await this.contestSubmissionRepository.save(contestSubmission);
      const invitedUser = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(user_id),
        }),
      );
      const admin_notification = await firstValueFrom(
        this.adminClient.send<any>(
          'get_notification_by_type',
          'CONTEST_REVISION_SUBMIT',
        ),
      );
      const joinRequestNotification = {
        title: admin_notification.notification_title
          .replace('*user*', invitedUser.general_profile.first_name)
          .replace('*contest name*', contest.title),
        content: admin_notification.notification_content
          .replace('*user*', invitedUser.general_profile.first_name)
          .replace('*contest name*', contest.title),
        type: admin_notification.notification_type,
        notification_from: user_id,
        notification_to: contestContestant.created_by,
        payload: contestSubmission,
      };

      await firstValueFrom(
        this.notificationClient.send<any>(
          'create_notification',
          JSON.stringify(joinRequestNotification),
        ),
      );
      const response = JSON.stringify(contestSubmissionCreated);
      // contestContestant.contest_submission = contestSubmissionCreated;
      if (data.contest_own_criteria) {
        for (let i = 0; i < data.contest_own_criteria.length; i++) {
          const coSubmission = new ContestOwnCriteriaSubmission();
          const own_criteria = await this.contestOwnCriteriaRepository.findOne({
            where: {
              id: Number(data.contest_own_criteria[i].contest_own_criteria_id),
            },
          });
          if (!own_criteria) {
            return {
              status: 500,
              message: 'Some own criteria not found.',
            };
          }
          coSubmission.contest = contest;
          coSubmission.contest_own_criteria = own_criteria;
          coSubmission.contest_submission = contestSubmission;
          coSubmission.created_by = user_id;
          coSubmission.description = data.contest_own_criteria[i].description;
          await this.contestOwnCriteriaSubmissionRepository.save(coSubmission);
        }
      }

      if (data.contest_revision_upload) {
        for (let i = 0; i < data.contest_revision_upload.length; i++) {
          const submissionUpload = new ContestSubmissionUpload();
          submissionUpload.contest = contest;
          submissionUpload.contest_submission = contestSubmission;
          submissionUpload.created_by = user_id;
          submissionUpload.name = data.contest_revision_upload[i].name;
          submissionUpload.description =
            data.contest_revision_upload[i].description;
          submissionUpload.file_url = data.contest_revision_upload[i].file_url;
          await this.contestSubmissionUploadRepository.save(submissionUpload);
        }
      }

      await this.contestContestantRepository.update(
        contestContestant.id,
        contestContestant,
      );
      return JSON.parse(response);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllReviews(id: number): Promise<any> {
    try {
      const reviews = await this.contestSubmissionReviewRepository.find({
        where: {
          contest: {
            id,
          },
        },
      });
      return reviews;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getSubmissionReview(
    id: number,
    contest_id: number,
  ): Promise<any> {
    try {
      const reviews = await this.contestSubmissionReviewRepository.find({
        where: {
          id: id,
          contest: {
            id: contest_id,
          },
        },
      });
      return reviews;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async reviewContestSubmission(
    contest_id: number,
    revision_id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: contest_id,
        },
      });
      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const contestRevision = await this.contestSubmissionRepository.findOne({
        where: {
          id: revision_id,
        },
      });

      if (!contestRevision) {
        throw new HttpException(
          'CONTEST_REVISION_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const contestJudge = await this.contestContestantRepository.findOne({
        where: {
          created_by: user_id,
          role: CONTESTANT_ROLE.JUDGE,
          contest: {
            id: contest.id,
          },
        },
      });

      if (!contestJudge) {
        throw new HttpException(
          'NOT_PART_OF_CONTEST',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const checkIds = await this.arrayColumn(
        data,
        'contest_own_criteria_submission_id',
      );
      const checkSubmission = await this.contestSubmissionReviewRepository.find(
        {
          where: {
            contest_own_criteria_submission: {
              id: In(checkIds),
            },
            created_by: user_id,
          },
        },
      );
      if (checkSubmission.length) {
        return {
          status: 500,
          message: 'One of submission is already judged.',
        };
      }
      const response = [];
      for (let i = 0; i < data.length; i++) {
        const contest_own_criteria_submission =
          await this.contestOwnCriteriaSubmissionRepository.findOne({
            where: {
              id: data[i].contest_own_criteria_submission_id,
            },
          });
        const csr = new ContestSubmissionReview();
        csr.contest = contest;
        csr.remark = data[i].remark;
        csr.rating = data[i].rating;
        csr.contest_submission = contestRevision;
        csr.created_by = user_id;
        csr.judge = contestJudge;
        csr.contest_own_criteria_submission = contest_own_criteria_submission;
        await this.contestSubmissionReviewRepository.save(csr);
        response.push(csr);
        await this.contestSubmissionRepository.update(contestRevision.id, {
          submission_status: CONTEST_SUBMISSION_STATUS.REVIEWED,
        });
      }
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateContestantById(
    status: string,
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const contest = await this.contestContestantRepository.findOne({
        where: {
          id: id,
        },
        relations: ['contest'],
      });

      if (!contest) {
        throw new HttpException(
          'CONTESTANT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.contestContestantRepository.update(id, {
        status: CONTESTANT_STATUS[status],
      });

      const contestantHost = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(contest.created_by),
        }),
      );
      if (contest.role === CONTESTANT_ROLE.JUDGE && status == 'ACCEPTED') {
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'CONTEST_JUDGE_ACCEPT',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*contest name*', contest.contest.title)
            .replace('*contest name*', contest.contest.title),
          content: admin_notification.notification_content
            .replace('*contest name*', contest.contest.title)
            .replace('*contest name*', contest.contest.title),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: contest.created_by,
          payload: contest,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );
        const payload: IMailPayload = {
          template: 'CONTEST_JUDGE_ACCEPT',
          payload: {
            emails: [contestantHost.email],
            data: {
              judgeFullName: contestantHost
                ? `${contestantHost.general_profile.first_name} ${contestantHost.general_profile.last_name}`
                : '',
              contest_name: contest.contest.title,
              link: `${this.configService.get<string>(
                'contest_join_request_url',
              )}/${contest.contest.id}/details/judges/judgeId=${id}`,
            },
            subject: `Your application to be a judge in a contest has been reviewed`,
          },
        };

        this.mailClient.emit('send_email', payload);
      }

      if (contest.role === CONTESTANT_ROLE.CONTESTANT && status == 'ACCEPTED') {
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'CONTEST_CONTESTANT_ACCEPT',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*contest name*', contest.contest.title)
            .replace('*contest name*', contest.contest.title),
          content: admin_notification.notification_content
            .replace('*contest name*', contest.contest.title)
            .replace('*contest name*', contest.contest.title),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: contest.created_by,
          payload: contest,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );

        const payload: IMailPayload = {
          template: 'CONTEST_CONTESTANT_ACCEPT',
          payload: {
            emails: [contestantHost.email],
            data: {
              judgeFullName: contestantHost
                ? contestantHost.general_profile.first_name
                : '',
              contest_name: contest.contest.title,
              link: `${this.configService.get<string>(
                'contest_join_request_url',
              )}/${contest.contest.id}/details/contestants/contestantId=${id}`,
            },
            subject: `Your application to join a contest has been reviewed`,
          },
        };

        this.mailClient.emit('send_email', payload);
      }
      return {
        status: 200,
        message: 'Contestant Updated',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addContestant(data: any): Promise<any> {
    try {
      const contest = await this.contestRepository.findOne({
        where: {
          id: data.contest_id,
        },
      });
      if (!contest) {
        throw new HttpException(
          'CONTEST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const invitedUser = await firstValueFrom(
        this.userClient.send('get_user_by_email', {
          email: data.email,
        }),
      );
      const contestant = new ContestContestant();
      contestant.role = data.role;
      contestant.created_by = invitedUser.id;
      contestant.status = CONTESTANT_STATUS.ACCEPTED;
      contestant.contest = contest;
      await this.contestContestantRepository.save(contestant);
      return {
        status: 200,
        message: 'Contestant added successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createContestTemplate(data: any): Promise<any> {
    try {
      const ct = new ContestTemplates();
      ct.template_name = data.template_name;
      ct.template_category = data.template_category;
      ct.contest_description = data.contest_description;
      ct.own_criteria = data.own_criteria;
      ct.contest_rules = data.contest_rules;
      ct.other_description = data.other_description;
      ct.attachments = data.attachments;

      const contestTemplateCreated =
        await this.contestTemplateRepository.save(ct);

      if (data.contest_prizes && data.contest_prizes.length > 0) {
        for (let i = 0; i < data.contest_prizes.length; i++) {
          const contestPrize = new ContestPrize();
          contestPrize.name = data.contest_prizes[i].name;
          contestPrize.amount = data.contest_prizes[i].amount;
          contestPrize.currency = data.contest_prizes[i].currency;
          contestPrize.royalty = data.contest_prizes[i].royalty;
          contestPrize.description = data.contest_prizes[i].description;
          contestPrize.created_by = 0;
          contestPrize.contest_template = ct;

          await this.contestPrizeRepository.save(contestPrize);
        }
      }

      if (data.contest_marks.length > 0) {
        for (let i = 0; i < data.contest_marks.length; i++) {
          const contestMark = new ContestMarks();
          contestMark.mark = data.contest_marks[i].mark;
          contestMark.title = data.contest_marks[i].title;
          contestMark.created_by = 0;
          contestMark.contest_template = ct;

          await this.contestMarksRepository.save(contestMark);
        }
      }

      return contestTemplateCreated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateContestTemplate(data: any): Promise<any> {
    const contestTemplate = await this.contestTemplateRepository.findOne({
      where: {
        id: data.id,
      },
    });

    if (!contestTemplate) {
      return {
        status: 404,
        message: 'Template not found',
      };
    }

    if (data.contest_prizes && data.contest_prizes.length > 0) {
      await this.contestPrizeRepository.delete({
        contest_template: {
          id: contestTemplate.id,
        },
      });

      for (let i = 0; i < data.contest_prizes.length; i++) {
        const contestPrize = new ContestPrize();
        contestPrize.name = data.contest_prizes[i].name;
        contestPrize.amount = data.contest_prizes[i].amount;
        contestPrize.currency = data.contest_prizes[i].currency;
        contestPrize.royalty = data.contest_prizes[i].royalty;
        contestPrize.description = data.contest_prizes[i].description;
        contestPrize.created_by = 0;
        contestPrize.contest_template = contestTemplate;

        await this.contestPrizeRepository.save(contestPrize);
      }
    }

    if (data.contest_marks && data.contest_marks.length > 0) {
      await this.contestMarksRepository.delete({
        contest_template: {
          id: contestTemplate.id,
        },
      });

      for (let i = 0; i < data.contest_marks.length; i++) {
        const contestMark = new ContestMarks();
        contestMark.mark = data.contest_marks[i].mark;
        contestMark.title = data.contest_marks[i].title;
        contestMark.created_by = 0;
        contestMark.contest_template = contestTemplate;

        await this.contestMarksRepository.save(contestMark);
      }
    }

    delete data.contest_marks;
    delete data.contest_prizes;

    await this.contestTemplateRepository.update(contestTemplate.id, data);

    return {
      status: 200,
      message: 'Customer Template updated successfully',
    };
  }

  public async getContestTemplates(data: any): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };

    const contestTemplate = await this.contestTemplateRepository.find({
      take: newD.take,
      skip: newD.skip,
    });

    return contestTemplate || [];
  }

  public async getContestTemplateById(id: number): Promise<any> {
    const contestTemplate = await this.contestTemplateRepository.findOne({
      where: {
        id: id,
      },
    });
    return contestTemplate || null;
  }

  public async deleteContestTemplateById(id: number): Promise<any> {
    const contestTemplate = await this.contestTemplateRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!contestTemplate) {
      return {
        status: 404,
        message: 'Template not found',
      };
    }

    await this.contestTemplateRepository.delete(id);

    return {
      status: 200,
      message: 'Template deleted successfully',
    };
  }

  public async createContestReaction(data: ContestReactionDto): Promise<any> {
    const contest = await this.contestRepository.findOne({
      where: {
        id: data.contest_id,
      },
    });
    if (!contest) {
      return {
        status: 500,
        message: 'No Contest found.',
      };
    }
    const contestReaction = new ContestReaction();
    contestReaction.contest = contest;
    contestReaction.reaction = data.reaction;
    contestReaction.user_id = data.user_id;
    await this.contestReactionRepository.save(contestReaction);
    return contestReaction;
  }

  public async updateContestReaction(id: number, data: any): Promise<any> {
    const contestReaction = await this.contestReactionRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!contestReaction) {
      return {
        status: 500,
        message: 'No Contest Reaction found.',
      };
    }
    if (data.contest_id) {
      const contest = await this.contestRepository.findOne({
        where: {
          id: data.contest_id,
        },
      });
      if (!contest) {
        return {
          status: 500,
          message: 'No contest found.',
        };
      }
      data.contest = contest;
      delete data.contest_id;
    }
    await this.contestReactionRepository.update(id, data);
    return {
      status: 200,
      message: 'Reaction update successfully.',
    };
  }

  public async getContestReaction(id: number): Promise<any> {
    const reaction = await this.contestReactionRepository.find({
      where: {
        contest: {
          id: id,
        },
      },
    });
    if (!reaction) {
      return {
        status: 500,
        message: 'No Contest Reaction found.',
      };
    }
    return reaction;
  }

  public async deleteContestReaction(id: number): Promise<any> {
    const reaction = await this.contestReactionRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!reaction) {
      return {
        status: 500,
        message: 'No Contest Reaction found.',
      };
    }
    await this.contestReactionRepository.delete(id);
    return {
      status: 200,
      message: 'Reaction deleted successfully.',
    };
  }

  public async cronUpdateContestState(): Promise<any> {
    console.log('CRON STARTED');
    const currentDate = new Date().toISOString();
    const contest = await this.contestRepository.find({
      where: {
        contest_end_date: LessThan(currentDate),
      },
    });
    for (let i = 0; i < contest.length; i++) {
      await this.contestRepository.update(
        { id: contest[i].id },
        { contest_state: CONTEST_STATE.COMPLETED },
      );
    }
    console.log('CRON ENDED');
  }

  public async generateRandomCode(user_id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: user_id,
        }),
      );

      const codeLength = 5;
      const characters = '0123456789';
      let code = '';
      for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
      }

      await firstValueFrom(
        this.userClient.send('claim_prize_generate_code', {
          code,
          user_id,
        }),
      );

      const payload: IMailPayload = {
        template: 'GENERATE_OTP',
        payload: {
          emails: [user.email],
          data: {
            code: `${code}`,
          },
          subject: `New OTP Generated`,
        },
      };
      this.mailClient.emit('send_email', payload);
      return `OTP : ${code}`;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async verifyCode(user_id: number, data: any): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: user_id,
        }),
      );

      if (user && user.otp == data.otp) {
        await firstValueFrom(
          this.userClient.send('verify_generated_code', user_id),
        );
      }
      return {
        status: 200,
        message: 'OTP Verify Successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async contestClaimPrize(
    user_id: number,
    contest_prize_id: number,
  ): Promise<any> {
    try {
      const contestPrize = await this.contestPrizeRepository.findOne({
        where: {
          id: contest_prize_id,
        },
      });

      if (!contestPrize) {
        return {
          status: 500,
          message: 'No Contest Prize Found',
        };
      }
      const claim_Prize = await this.contestClaimPrizeRepository.findOne({
        where: {
          user_id: user_id,
          contest_prizes: {
            id: contest_prize_id,
          },
        },
      });

      if (claim_Prize) {
        await this.contestClaimPrizeRepository.update(claim_Prize.id, {
          is_claimed: TRUE_FALSE.TRUE,
        });
        return {
          status: 500,
          message: 'You already claimed this prize',
        };
      } else {
        const claimPrize = new ContestClaimPrize();
        claimPrize.contest_prizes = contestPrize;
        claimPrize.user_id = user_id;
        claimPrize.status = CLIME_PRIZE_STATUS.CLAIMED;
        await this.contestClaimPrizeRepository.save(claimPrize);
        return claimPrize;
      }
      return claim_Prize;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateClimePrize(
    id: number,
    contest_prize_id: number,
  ): Promise<any> {
    try {
      const claimPrize = await this.contestClaimPrizeRepository.find({
        where: {
          contest_prizes: {
            id: contest_prize_id,
          },
          user_id: id,
        },
      });

      if (!claimPrize) {
        return {
          status: 500,
          message: 'No Clime Prize Found',
        };
      }
      const response = [];
      for (let i = 0; i < claimPrize.length; i++) {
        const update = await this.contestClaimPrizeRepository.update(
          claimPrize[i].id,
          {
            is_claimed: TRUE_FALSE.TRUE,
          },
        );
        response.push(update);
      }
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
