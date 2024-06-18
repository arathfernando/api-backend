import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AccountSetting,
  Setting,
  CloseAccount,
  MergeAccount,
  User,
} from 'src/database/entities';
import { allSettings } from '../database/migrations/settings';
import {
  MERGE_ACCOUNT_STATUS,
  STATUS,
  TRUE_FALSE,
  YES_NO,
} from 'src/helper/constant';
import { tableList } from 'src/database/migrations/cron-table-list';
import {
  CreateSettingDto,
  GetUsersForSiteDto,
  SearchUserDto,
  VerifyAccountDto,
  MergeAccountDto,
} from 'src/helper/dtos';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { In, IsNull, Repository } from 'typeorm';
import { UpdateUserPasswordDto } from 'src/helper/dtos/update-user-password.dto';
import { UpdateUserEmailDto } from 'src/helper/dtos/update-user-email.dto';
import * as bcrypt from 'bcrypt';
import { IMailPayload } from 'src/helper/interfaces';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('TOKEN_SERVICE') private readonly tokenClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @InjectRepository(AccountSetting)
    private readonly accountSettingRepository: Repository<AccountSetting>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CloseAccount)
    private readonly closeAccountRepository: Repository<CloseAccount>,
    @InjectRepository(MergeAccount)
    private readonly mergeAccountRepository: Repository<MergeAccount>,
    private configService: ConfigService,
  ) {
    this.adminClient.connect();
    this.communityClient.connect();
  }

  public async getAllSettings(user_id: number): Promise<any> {
    try {
      const accountSettings = await this.accountSettingRepository.find({
        where: {
          user: {
            id: user_id,
          },
        },
        relations: ['setting'],
      });

      return accountSettings;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async saveAccountSetting(
    data: CreateSettingDto,
    user_id: number,
  ): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
      });

      if (!user) {
        throw new HttpException(
          'USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      for (let i = 0; i < data.settings.length; i++) {
        const setting = await this.settingRepository.findOne({
          where: {
            key: data.settings[i].setting_key,
          },
        });

        if (!setting) {
          throw new HttpException(
            'SETTING_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const accSetting = new AccountSetting();
        accSetting.setting = setting;
        accSetting.user = user;
        accSetting.value = data.settings[i].setting_value;

        await this.accountSettingRepository.save(accSetting);
      }

      return {
        status: 200,
        message: 'Setting saved successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAccountSetting(data: any, user_id: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
      });

      if (!user) {
        throw new HttpException(
          'USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      for (let i = 0; i < data.settings.length; i++) {
        const setting = await this.settingRepository.findOne({
          where: {
            key: data.settings[i].setting_key,
          },
        });

        if (!setting) {
          throw new HttpException(
            'SETTING_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const accSetting = await this.accountSettingRepository.findOne({
          where: {
            setting: {
              id: setting.id,
            },
            user: {
              id: user_id,
            },
          },
        });

        if (!accSetting) {
          throw new HttpException(
            'ACCOUNT_SETTING_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        data.settings[i].setting = setting;
        data.settings[i].value = data.settings[i].setting_value;
        delete data.settings[i].setting_key;
        delete data.settings[i].setting_value;

        await this.accountSettingRepository.update(
          accSetting.id,
          data.settings[i],
        );
      }

      return {
        status: 200,
        message: 'Settings updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addDefaultSettings(): Promise<any> {
    try {
      for (let i = 0; i < allSettings.length; i++) {
        const setting = new Setting();
        setting.key = allSettings[i].key;
        setting.display_name = allSettings[i].display_name;

        await this.settingRepository.save(setting);
      }

      return await this.settingRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getDefaultSettings(): Promise<any> {
    try {
      return await this.settingRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async closeAccount(user_id, data): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: user_id },
      });
      if (!user) {
        throw new HttpException(
          'USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const closeAcc = new CloseAccount();
      closeAcc.reason = data.reason;
      closeAcc.feedback = data.feedback;
      closeAcc.user_id = user_id;
      await this.closeAccountRepository.save(closeAcc);
      user.status = STATUS.CLOSED;
      await this.userRepository.save(user);
      return {
        status: 200,
        message: 'Account Closed successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async searchUser(data: SearchUserDto): Promise<any> {
    try {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.general_profile', 'general_profile')
        .where('LOWER(user.email) like LOWER(:name)', {
          name: `%${data.search.toLowerCase()}%`,
        })
        .orWhere('LOWER(general_profile.first_name) like LOWER(:name)', {
          name: `%${data.search}%`,
        })
        .orWhere('LOWER(general_profile.last_name) like LOWER(:name)', {
          name: `%${data.search}%`,
        })
        .getMany();

      if (users.length > 0) {
        return users;
      } else {
        return {
          status: 500,
          message: 'No User found',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getHubberUser() {
    try {
      const user: any = await this.userRepository
        .createQueryBuilder('user')
        .where('user.is_hubber_team = :is_hubber_team', {
          is_hubber_team: TRUE_FALSE.TRUE,
        })
        .leftJoinAndSelect('user.hubbers_team_profile', 'hubbers_team_profile')
        .andWhere('hubbers_team_profile.is_published = :is_published', {
          is_published: YES_NO.YES,
        })
        .orderBy('hubbers_team_profile.order', 'ASC')
        .getMany();

      if (!user || user.length === 0) {
        throw new HttpException(
          'USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const userRes = [...user];
      const finalRes = [];

      for (let i = 0; i < userRes.length; i++) {
        if (userRes[i].hubbers_team_profile) {
          delete userRes[i].password;
          delete userRes[i].verification_code;
          delete userRes[i].reset_password_otp;
          finalRes.push(userRes[i]);
        }
      }

      return finalRes;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getCommunityHost() {
    try {
      return (
        (await firstValueFrom(
          this.communityClient.send('get_community_host', ''),
        )) || []
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getHubberUsers(data: GetUsersForSiteDto) {
    try {
      const users: any = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.general_profile', 'general_profile')
        .where('general_profile.avatar != :data', {
          data: IsNull(),
        })
        .orderBy('user.id', 'DESC')
        .limit(data.limit)
        .getMany();
      if (!users || users.length === 0) {
        throw new HttpException(
          'USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const responseUsers = [];
      if (users && users.length > 0) {
        for (let i = 0; i < users.length; i++) {
          responseUsers.push({
            first_name: users[i].general_profile.first_name,
            last_name: users[i].general_profile.last_name,
            email: users[i].email,
            avatar: users[i].general_profile.avatar,
            nationality: users[i].general_profile.nationality,
            location: users[i].general_profile.location,
          });
        }
      }

      return responseUsers;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAdminGoals() {
    try {
      const goals = await firstValueFrom(
        this.adminClient.send('get_all_goals', ''),
      );
      return goals || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserPassword(
    data: UpdateUserPasswordDto,
    user_id: number,
  ) {
    try {
      const checkPassword = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
      });
      const current_password = bcrypt.compareSync(
        data.current_password,
        checkPassword.password,
      );
      const new_password = bcrypt.hashSync(data.new_password, 8);
      if (!current_password) {
        return {
          status: 500,
          message: 'Current password is wrong.',
        };
      }
      await this.userRepository.update(
        { id: user_id },
        { password: new_password },
      );
      return {
        status: 200,
        message: 'Password updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserFcmToken(token: string, user_id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
      });
      if (!user) {
        return {
          status: 500,
          message: 'No user found.',
        };
      }
      await this.userRepository.update({ id: user_id }, { fcm_token: token });
      return await this.findUserAccountByEmail(user.email);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async findUserAccountByEmail(email: string): Promise<User> {
    try {
      return this.userRepository.findOne({
        relations: [
          'general_profile',
          'account_settings',
          'account_settings.setting',
        ],
        where: {
          email: email,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  public async updateUserEmail(data: UpdateUserEmailDto, user_id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
        relations: ['general_profile'],
      });
      user.email = data.new_email_address;
      const verificationCode = await firstValueFrom(
        this.tokenClient.send(
          'verification_token_create',
          JSON.stringify(user),
        ),
      );

      await this.userRepository.save({
        id: user.id,
        verification_code: verificationCode.verificationToken,
      });

      const payload: IMailPayload = {
        template: 'EMAIL_VERIFICATION',
        payload: {
          emails: [user.email],
          data: {
            id: user.id,
            name: `${user.general_profile.first_name} ${user.general_profile.last_name}`,
            link: `${this.configService.get<string>('update_email_url')}/${
              verificationCode.verificationToken
            }`,
          },
          subject: 'Welcome to Hubbers! Please verify your account.',
        },
      };

      this.mailClient.emit('send_email', payload);
      await this.userRepository.update(
        { id: user_id },
        { verification_code: verificationCode.verificationToken },
      );
      return {
        status: 200,
        message: 'email address updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserEmailVerify(data: VerifyAccountDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          verification_code: data.token,
        },
      });
      if (!user) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      if (user.verification_code === data.token) {
        const decode = await firstValueFrom(
          this.tokenClient.send('verification_token_decode', data.token),
        );
        if (!decode) {
          throw new HttpException('INVALID_TOKEN', HttpStatus.NOT_FOUND);
        }

        user.verification_code = null;
        user.email = decode.email;
        await this.userRepository.save(user);

        return {
          status: 200,
          message: 'email is updated',
        };
      } else {
        throw new HttpException('INVALID_TOKEN', HttpStatus.NOT_FOUND);
      }
    } catch (e) {
      console.log('E :>', e);
      throw new InternalServerErrorException(e);
    }
  }

  public async getPopularContest() {
    try {
      const contest = await firstValueFrom(
        this.communityClient.send(
          'get_popular_contest',
          JSON.stringify({ page: 1, limit: 5 }),
        ),
      );
      return contest || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async mergeUserAccount(data: MergeAccountDto, user_id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: data.email,
        },
      });
      if (!user) {
        return {
          status: 500,
          message: 'No user found.',
        };
      }
      const current_password = bcrypt.compareSync(data.password, user.password);
      if (!current_password) {
        return {
          status: 500,
          message: 'Invalid password.',
        };
      }
      const mergeAccount = new MergeAccount();
      mergeAccount.current_user_id = user_id;
      mergeAccount.merge_user_id = user.id;
      await this.mergeAccountRepository.save(mergeAccount);
      return {
        status: 200,
        message: 'Request successfully received for merge account.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteUserAccount(user_id: number) {
    try {
      const dateObj = new Date();
      const date = dateObj.toISOString();
      await this.userRepository.update(
        { id: user_id },
        {
          status: STATUS.CLOSED,
          closed_date: date,
        },
      );
      return {
        status: 200,
        message: 'Request successfully received for delete account.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async cronMergeUserAccount() {
    try {
      console.log('CRON STARTED');
      const userRequest = await this.mergeAccountRepository.find({
        where: {
          status: MERGE_ACCOUNT_STATUS.PENDING,
        },
        take: 10,
      });
      const updateIds = await this.arrayColumn(userRequest, 'id');
      await this.mergeAccountRepository.update(
        {
          id: In(updateIds),
        },
        {
          status: MERGE_ACCOUNT_STATUS.ON_GOING,
        },
      );
      for (let i = 0; i < userRequest.length; i++) {
        const current_user = userRequest[i].current_user_id;
        const merge_user = userRequest[i].merge_user_id;
        for (let j = 0; j < tableList.length; j++) {
          for (let k = 0; k < tableList[j].field.length; k++) {
            await this.mergeAccountRepository.query(`
              UPDATE "${tableList[j].table_name}"
                SET ${tableList[j].field[k]} = ${current_user}
                WHERE CAST(${tableList[j].field[k]} AS int) = ${merge_user};
            `);
          }
        }
        await this.mergeAccountRepository.update(
          {
            id: userRequest[i].id,
          },
          {
            status: MERGE_ACCOUNT_STATUS.COMPLETED,
          },
        );
      }
      console.log('CRON COMPLETE');
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
