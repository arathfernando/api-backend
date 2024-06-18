import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app.service';
import {
  CreatorProfile,
  ExpertProfile,
  InvestorProfile,
  InviteInvestor,
  User,
} from 'src/database/entities';
import { InvestorDto, InviteInvestorDto } from 'src/helper/dtos';
import { IMailPayload } from 'src/helper/interfaces';
import { In, Repository } from 'typeorm';

@Injectable()
export class InvestorService {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    private readonly appService: AppService,
    @InjectRepository(InvestorProfile)
    private readonly investorRepo: Repository<InvestorProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(InviteInvestor)
    private readonly inviteInvestorRepository: Repository<InviteInvestor>,
    @InjectRepository(ExpertProfile)
    private readonly expertRepo: Repository<ExpertProfile>,
    @InjectRepository(CreatorProfile)
    private readonly creatorRepo: Repository<CreatorProfile>,
  ) {
    this.adminClient.connect();
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

  async createProfile(user_id: number, data: InvestorDto): Promise<any> {
    try {
      const checkProfileExist = await this.investorRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (checkProfileExist) {
        throw new HttpException(
          'INVESTOR_PROFILE_ALREADY_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      const user = await this.appService.getUserById(user_id);

      const expertProf = new InvestorProfile();

      expertProf.experience_investor = data.experience_investor;
      expertProf.agree_to_invest = data.agree_to_invest;
      expertProf.investment_currency = data.investment_currency
        ? data.investment_currency
        : null;
      expertProf.investment_amount = data.investment_amount
        ? data.investment_amount
        : null;
      expertProf.have_geo_preference = data.have_geo_preference;
      expertProf.geo_preference = data.geo_preference
        ? data.geo_preference
        : data.geo_preference;
      expertProf.city = data.city ? data.city : data.city;
      expertProf.user = user;

      const gpUpdated = await this.investorRepo.save(expertProf);
      await this.userRepository.update(user.id, {
        investor_profile: gpUpdated,
      });
      return gpUpdated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProfile(user_id: number, data: InvestorDto): Promise<any> {
    try {
      const checkProfileExist = await this.investorRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!checkProfileExist) {
        throw new HttpException(
          'INVESTOR_PROFILE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      await this.investorRepo.update(
        {
          user: {
            id: user_id,
          },
        },
        data,
      );

      return {
        status: 200,
        message: 'Investor profile is updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getProfile(data: any): Promise<any> {
    try {
      const profile = await this.investorRepo.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
      });

      if (!profile) {
        throw new HttpException(
          'INVESTOR_PROFILE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      // if (profile.investment_currency > 0) {
      //   const currencyData = await firstValueFrom(
      //     this.adminClient.send<any>(
      //       'get_currency_by_id',
      //       profile.investment_currency,
      //     ),
      //   );

      //   profile.investment_currency = currencyData;
      // }

      return profile;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMyInvestment(user_id: number, id: number): Promise<any> {
    try {
      let total_area_share = 0;
      let total_user_share = 0;
      let total_user_share_value = 0;
      let current_value_of_share = 0;
      let total_gain_value = 0;
      let annual_return = 0.0;
      let total_user_increase = 0;
      const userInvest = await firstValueFrom(
        this.adminClient.send<any>(
          'get_user_investment_by_zone',
          JSON.stringify({ user_id: user_id, zone_id: id }),
        ),
      );
      if (userInvest.status && userInvest.message) {
        return {
          total_area_share: 0,
          total_user_share: 0,
          total_user_increase: 0,
          current_value_of_share: 0,
          current_value_of_hbs: 0,
          total_gain_value: 0,
          annual_return: 0,
          total_usd_increase: 0,
        };
      }
      const total_area_share_add = [];
      for (let i = 0; i < userInvest.length; i++) {
        if (
          total_area_share_add.includes(userInvest[i].share_area.id) == false
        ) {
          total_area_share =
            total_area_share + userInvest[i].share_area.amount_share;
          total_area_share_add.push(userInvest[i].share_area.id);
        }

        total_user_share = total_user_share + userInvest[i].share_qty;
        total_user_share_value =
          total_user_share_value + userInvest[i].price_to_date;
        total_user_increase =
          total_user_increase + userInvest[i].total_increase;
        current_value_of_share =
          current_value_of_share + userInvest[i].price_to_date;
        total_gain_value = total_gain_value + userInvest[i].gain_value;
        if (annual_return == 0) {
          annual_return = annual_return + (1 + userInvest[i].annual_return);
        } else {
          annual_return = annual_return + (1 + userInvest[i].annual_return);
        }
      }
      let current_value_of_share_data;
      if (id == 0) {
        current_value_of_share_data = total_user_share_value / total_user_share;
      } else {
        current_value_of_share_data = parseFloat(
          userInvest[0].current_zone_price.price_share,
        );
      }
      const prefix = 1 / (userInvest.length - 1);
      return {
        total_area_share: total_area_share,
        total_user_share: total_user_share,
        total_user_increase: total_user_increase / userInvest.length,
        current_value_of_share: current_value_of_share_data,
        current_value_of_hbs: current_value_of_share,
        total_gain_value: total_gain_value,
        annual_return: annual_return ** prefix,
        total_usd_increase: total_user_increase / userInvest.length,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserInvestmentDetails(user_id: number, data: any): Promise<any> {
    try {
      const userInvest = await firstValueFrom(
        this.adminClient.send<any>(
          'get_user_investment_details',
          JSON.stringify({ id: user_id, data: data }),
        ),
      );
      return userInvest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private findObject(arr, value, return_type) {
    const element = arr.find((val) => {
      return Number(val.user) === Number(value);
    });

    if (return_type === 'bool') {
      return typeof element === 'undefined' ? false : true;
    } else {
      return element;
    }
  }

  private async findUserShareObject(arr, value) {
    const user = [];
    for (let i = 0; i < arr.length; i++) {
      Number(arr[i].user) === Number(value) ? user.push(arr[i]) : '';
    }
    const userShare = await this.arrayColumn(user, 'share_qty');
    return await userShare.reduce(
      (partialSum, a) => Number(partialSum) + Number(a),
      0,
    );
  }

  async getZoneInvestor(id: number): Promise<any> {
    try {
      const allUserInvest = await firstValueFrom(
        this.adminClient.send<any>('get_investor_by_zone', id),
      );
      const userIds = await this.arrayColumn(allUserInvest, 'user');
      const allUser: any = await this.userRepository.find({
        where: {
          id: In(userIds),
        },
        relations: ['general_profile'],
      });
      if (!allUser.length) {
        return {
          status: 500,
          message: 'No user found for selected area.',
        };
      }
      for (let i = 0; i < allUser.length; i++) {
        const total = await this.findUserShareObject(
          allUserInvest,
          allUser[i].id,
        );

        const userInvest = await this.findObject(
          allUserInvest,
          allUser[i].id,
          '',
        );
        const zone = await firstValueFrom(
          this.adminClient.send<any>('get_share_area', userInvest.share_area),
        );
        if (zone.status && zone.status == 500) {
          return {
            status: 500,
            message: 'No area share found.',
          };
        }
        const share_area: any = await this.userRepository.query(
          `SELECT * FROM assign_share WHERE "user_id" = ${allUser[i].id}`,
        );
        const shareAreaIds = await this.arrayColumn(share_area, 'share_area');
        const dataDATA = shareAreaIds.join(',');
        const zonesData: any = await this.userRepository.query(
          `SELECT * FROM zones WHERE area_share_id IN(${dataDATA})`,
        );
        allUser[i].area_share = zone;
        allUser[i].zone = zonesData;
        delete allUser[i].verification_code;
        delete allUser[i].reset_password_otp;
        delete allUser[i].linkedin_id;
        delete allUser[i].is_login_with_linkedin;
        allUser[i].hbs_count = 0;
        if (userInvest.user == allUser[i].id) {
          allUser[i].hbs_count = allUser[i].hbs_count + total;
        }
      }

      return allUser;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  async getShare(id: number, user_id: number): Promise<any> {
    try {
      const data = {
        id: id,
        user_id: user_id,
      };
      const zone: any = await firstValueFrom(
        this.adminClient.send<any>('zone_share', JSON.stringify(data)),
      );
      if (zone.status && zone.status == 500) {
        return {
          status: 500,
          message: 'No zone found.',
        };
      }
      return zone;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  public async getUserInvestmentCommunity(user_id: number) {
    try {
      const allUserInvestZone = await firstValueFrom(
        this.adminClient.send<any>('get_user_investment_zone_list', user_id),
      );
      const community_ids = await this.arrayColumn(
        allUserInvestZone,
        'community_id',
      );

      const community_id = community_ids.filter(this.onlyUnique);

      if (!community_id.length) {
        return {
          status: 500,
          message: 'No investment found.',
        };
      }
      const response_data = [];
      for (let i = 0; i < community_id.length; i++) {
        const community = await firstValueFrom(
          this.communityClient.send<any>(
            'get_community_by_id_investor',
            JSON.stringify({ id: community_id[i], user_id: user_id }),
          ),
        );

        response_data.push(community);
      }
      return response_data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async inviteInvestor(user_id: number, data: InviteInvestorDto): Promise<any> {
    try {
      const invitedByUser = await this.getUser(user_id);
      for (let i = 0; i < data.email.length; i++) {
        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_email', {
            email: data.email[i],
          }),
        );
        if (invitedUser.id) {
          const investorUser = await this.inviteInvestorRepository.findOne({
            where: {
              user_id: invitedUser.id,
            },
          });
          if (investorUser) {
            return {
              status: 500,
              message: `You've already invited.`,
            };
          }
          if (investorUser) {
            investorUser.invited_by = user_id;
            await this.inviteInvestorRepository.update(
              investorUser.id,
              investorUser,
            );
          }

          if (!investorUser) {
            const investorInvite = new InviteInvestor();
            investorInvite.email = data.email[i];
            investorInvite.invited_by = user_id;
            investorInvite.user_id = invitedUser.id;

            await this.inviteInvestorRepository.save(investorInvite);
            const admin_notification = await firstValueFrom(
              this.adminClient.send<any>(
                'get_notification_by_type',
                'INVESTOR_INVITE_REQUEST',
              ),
            );
            const joinRequestNotification = {
              title: admin_notification.notification_title.replace(
                '*user*',
                invitedByUser.general_profile.first_name,
              ),
              content: admin_notification.notification_content.replace(
                '*user*',
                invitedByUser.general_profile.first_name,
              ),
              type: admin_notification.notification_type,
              notification_from: user_id,
              notification_to: invitedUser.id,
              payload: investorInvite,
            };

            await firstValueFrom(
              this.notificationClient.send<any>(
                'create_notification',
                JSON.stringify(joinRequestNotification),
              ),
            );
            const payload: IMailPayload = {
              template: 'WELCOME_INVESTOR',
              payload: {
                data: {},
                emails: [invitedUser.email],
                subject: `You got invite to join as investor at hubbers`,
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

  public async getUserInvestmentCount() {
    try {
      const investor = await this.investorRepo.find({
        order: {
          id: 'DESC',
        },
      });
      const investorCount = investor.length;

      const expert = await this.expertRepo.find({
        order: {
          id: 'DESC',
        },
      });
      const expertCount = expert.length;

      const creator = await this.creatorRepo.find({
        order: {
          id: 'DESC',
        },
      });
      const creatorCount = creator.length;

      return {
        innovators_count: creatorCount,
        export_count: expertCount,
        investor_count: investorCount,
        lifetime_member: 0,
        hub_activity: 0,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
