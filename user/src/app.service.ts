import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import {
  GeneralProfile,
  User,
  CreatorProfile,
  ExpertProfile,
  InvestorProfile,
  HubbersTeamProfile,
  TeacherProfile,
  AccountSetting,
} from './database/entities';
import {
  PROFILE_TYPES,
  ROLES,
  STATUS,
  TRUE_FALSE,
  USER_CREATED_BY,
  USER_STATE,
} from './helper/constant';
import {
  ChangePasswordDto,
  CreateUserDto,
  LinkedinDto,
  LoginDto,
  SelectProfileDto,
  updateUserDto,
} from './helper/dtos';
import { IMailPayload } from './helper/interfaces';
import { generateRandomNumber } from './helper/random-number.helper';

import { AppleDto } from './helper/dtos/apple.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(GeneralProfile)
    private readonly generalProfileRepository: Repository<GeneralProfile>,
    @InjectRepository(CreatorProfile)
    private readonly creatorProfileRepo: Repository<CreatorProfile>,
    @InjectRepository(ExpertProfile)
    private readonly expertProfileRepo: Repository<ExpertProfile>,
    @InjectRepository(InvestorProfile)
    private readonly investorProfileRepo: Repository<InvestorProfile>,
    @InjectRepository(HubbersTeamProfile)
    private readonly hubbersTeamRepo: Repository<HubbersTeamProfile>,
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
    @InjectRepository(AccountSetting)
    private readonly accountSettingRepository: Repository<AccountSetting>,
    private configService: ConfigService,
  ) {
    this.tokenClient.connect();
    this.mailClient.connect();
  }

  public async getUserById(userId: number) {
    try {
      const userData = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: ['general_profile'],
      });
      if (!userData) {
        const newUser = new User();
        return newUser;
      }
      return userData;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async getUserSettingById(user_id: number) {
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
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async getUserProfileById(userId: number) {
    const userData = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: [
        'general_profile',
        'general_profile.interest',
        'creator_profile',
        'hubbers_team_profile',
        'teacher_profile',
        'investor_profile',
        'expert_profile',
      ],
    });
    if (!userData) {
      const newUser = new User();
      return newUser;
    }
    return userData;
  }

  public async getUserByEmail(email: string) {
    const data = await this.userRepository.findOne({
      where: {
        email: email,
      },
      relations: ['general_profile'],
    });
    return data || [];
  }

  public async login(data: LoginDto) {
    try {
      const { email, password } = data;
      const checkUser = await this.findUserAccountByEmail(email);

      if (!checkUser) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.CONFLICT);
      }

      const passwordIsValid = bcrypt.compareSync(password, checkUser.password);

      if (!passwordIsValid == true) {
        throw new HttpException('INVALID_PASSWORD', HttpStatus.CONFLICT);
      }

      if (checkUser.status === STATUS.INACTIVE) {
        throw new HttpException('UNVERIFIED_ACCOUNT', HttpStatus.CONFLICT);
      }

      if (checkUser.status === STATUS.CLOSED) {
        throw new HttpException('CLOSED_ACCOUNT', HttpStatus.CONFLICT);
      }

      const createTokenResponse = await firstValueFrom(
        this.tokenClient.send('token_create', JSON.stringify(checkUser)),
      );

      delete checkUser.password;
      return {
        ...createTokenResponse,
        user: checkUser,
      };
    } catch (e) {
      try {
        throw new RpcException(e);
      } catch {
        throw new InternalServerErrorException(e);
      }
    }
  }

  public async createUser(data: any): Promise<any> {
    try {
      const { email, password, first_name, last_name, role, avatar } = data;
      const checkUser = await this.findUserAccountByEmail(email);
      if (checkUser) {
        throw new HttpException('USER_EXISTS', HttpStatus.CONFLICT);
      }
      const hashPassword = bcrypt.hashSync(password, 8);

      const newGeneralProfile = new GeneralProfile();

      const newUser = new User();
      newUser.profile_uid = await generateRandomNumber(5, true);
      newUser.email = email;
      newUser.user_created_by = data.user_created_by
        ? data.user_created_by
        : USER_CREATED_BY.SELF;
      newUser.password = hashPassword;
      newUser.role = role;
      newUser.is_hubber_team = data.is_hubber_team
        ? data.is_hubber_team
        : TRUE_FALSE.FALSE;
      newUser.is_completed_three_step_process = TRUE_FALSE.FALSE;
      const user = await this.userRepository.save(newUser);
      const createTokenResponse = await firstValueFrom(
        this.tokenClient.send('token_create', JSON.stringify(user)),
      );

      newGeneralProfile.avatar = avatar;
      newGeneralProfile.role = role;
      newGeneralProfile.first_name = first_name;
      newGeneralProfile.last_name = last_name;
      newGeneralProfile.user = user;

      const generalP =
        await this.generalProfileRepository.save(newGeneralProfile);

      const verificationCode = await firstValueFrom(
        this.tokenClient.send(
          'verification_token_create',
          JSON.stringify(user),
        ),
      );

      await this.userRepository.save({
        id: user.id,
        general_profile: generalP,
        hashed_refresh_token: bcrypt.hashSync(
          createTokenResponse.refreshToken,
          8,
        ),
        verification_code: verificationCode.verificationToken,
      });
      if (data.profile_types) {
        await this.createEmptyProfile(
          { profile_types: data.profile_types.split(',') },
          user.id,
        );
      }
      const userRes = {
        first_name: first_name,
        last_name: last_name,
        email: user.email,
        role: user.role,
      };

      const payload: IMailPayload = {
        template: 'EMAIL_VERIFICATION',
        payload: {
          emails: [user.email],
          data: {
            id: user.id,
            name: `${first_name} ${last_name}`,
            link: `${this.configService.get<string>(
              'verification_front_url',
            )}/${verificationCode.verificationToken}`,
          },
          subject: 'Welcome to Hubbers! Please verify your account.',
        },
      };

      this.mailClient.emit('send_email', payload);

      return {
        user: userRes,
      };
    } catch (e) {
      try {
        throw new RpcException(e);
      } catch {
        throw new InternalServerErrorException(e);
      }
    }
  }
  public async createEmptyProfile(
    data: SelectProfileDto,
    user_id: number,
  ): Promise<any> {
    try {
      const user = await this.getUserById(user_id);

      for (let i = 0; i < data.profile_types.length; i++) {
        const element = data.profile_types[i];
        if (element === PROFILE_TYPES.CREATOR) {
          const creatorProfile = new CreatorProfile();
          creatorProfile.user = user;

          const created = await this.creatorProfileRepo.save(creatorProfile);
          user.creator_profile = created;

          await this.userRepository.save(user);
        }

        if (element === PROFILE_TYPES.EXPERT) {
          const expertProfile = new ExpertProfile();
          expertProfile.user = user;

          const created = await this.expertProfileRepo.save(expertProfile);
          user.expert_profile = created;

          await this.userRepository.save(user);
        }

        if (element === PROFILE_TYPES.INVESTOR) {
          const investorProfile = new InvestorProfile();
          investorProfile.user = user;

          const created = await this.investorProfileRepo.save(investorProfile);

          user.investor_profile = created;
          await this.userRepository.save(user);
        }

        if (element === PROFILE_TYPES.HUBBERS_TEAM) {
          const hubbersProfile = new HubbersTeamProfile();
          hubbersProfile.user = user;

          const created = await this.hubbersTeamRepo.save(hubbersProfile);

          user.hubbers_team_profile = created;
          await this.userRepository.save(user);
        }
        if (element === PROFILE_TYPES.TEACHER) {
          const teacherProfile = new TeacherProfile();
          teacherProfile.user = user;

          const created =
            await this.teacherProfileRepository.save(teacherProfile);

          user.teacher_profile = created;
          await this.userRepository.save(user);
        }
      }
      return {
        status: 200,
        message: 'Profile created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateUser(data: any): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: data.id,
        },
        relations: [
          'general_profile',
          'general_profile.interest',
          'creator_profile',
          'hubbers_team_profile',
          'teacher_profile',
          'investor_profile',
          'expert_profile',
        ],
      });

      if (!user) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }
      if (typeof data.profile_types != 'undefined') {
        if (user.creator_profile) {
          await this.creatorProfileRepo.remove(user.creator_profile);
        }
        if (user.expert_profile) {
          await this.expertProfileRepo.remove(user.expert_profile);
        }
        if (user.investor_profile) {
          await this.investorProfileRepo.remove(user.investor_profile);
        }
        if (user.teacher_profile) {
          await this.teacherProfileRepository.remove(user.teacher_profile);
        }
        if (user.hubbers_team_profile) {
          await this.hubbersTeamRepo.remove(user.hubbers_team_profile);
        }
      }
      if (data.profile_types && data.profile_types != '') {
        await this.createEmptyProfile(
          { profile_types: data.profile_types.split(',') },
          user.id,
        );
      }
      delete data.profile_types;
      const check: any = { ...data };
      if (Object.keys(check).length) {
        const loopData = Object.keys(check);
        for (let i = 0; i < loopData.length; i++) {
          user[loopData[i]] = data[loopData[i]];
        }
        await this.userRepository.update(
          {
            id: data.id,
          },
          data,
        );
      }

      return {
        status: 200,
        message: 'User profile updated',
      };
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async allUsers(data: any): Promise<any> {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'profile_uid', 'email', 'role', 'status', 'createdAt'],
        relations: ['general_profile'],
        take: data.take,
        skip: data.skip,
      });

      return users;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async deleteUser(id: number): Promise<any> {
    try {
      const user = await this.getUserById(id);
      if (!user.id) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.CONFLICT);
      }

      await this.userRepository.delete(id);

      return {
        status: 200,
        message: 'User deleted successfully',
      };
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async getUserInterests(id: number): Promise<any> {
    try {
      const user = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: id,
          },
        },
        relations: ['interest'],
      });

      if (!user) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      const interest_return = [];
      for (let i = 0; i < user.interest.length; i++) {
        const interests = await firstValueFrom(
          this.adminClient.send(
            'get_basic_type_ids',
            JSON.stringify(user.interest[i].interests),
          ),
        );
        interest_return.push(interests[0]);
      }

      return interest_return;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async signup(data: CreateUserDto) {
    try {
      const { email, password, first_name, last_name } = data;
      const checkUser = await this.findUserAccountByEmail(email);
      if (checkUser) {
        throw new HttpException('USER_EXISTS', HttpStatus.CONFLICT);
      }
      const hashPassword = bcrypt.hashSync(password, 8);

      const newGeneralProfile = new GeneralProfile();

      const newUser = new User();
      newUser.profile_uid = await generateRandomNumber(5, true);
      newUser.email = data.email;
      newUser.password = hashPassword;
      newUser.role = ROLES.STANDARD;

      const user = await this.userRepository.save(newUser);
      const createTokenResponse = await firstValueFrom(
        this.tokenClient.send('token_create', JSON.stringify(user)),
      );

      newGeneralProfile.first_name = first_name;
      newGeneralProfile.last_name = last_name;
      newGeneralProfile.user = user;

      const generalP =
        await this.generalProfileRepository.save(newGeneralProfile);

      const verificationCode = await firstValueFrom(
        this.tokenClient.send(
          'verification_token_create',
          JSON.stringify(user),
        ),
      );

      await this.userRepository.save({
        id: user.id,
        general_profile: generalP,
        hashed_refresh_token: bcrypt.hashSync(
          createTokenResponse.refreshToken,
          8,
        ),
        verification_code: verificationCode.verificationToken,
      });

      const userRes = {
        first_name: first_name,
        last_name: last_name,
        email: user.email,
        role: user.role,
      };

      const payload: IMailPayload = {
        template: 'EMAIL_VERIFICATION',
        payload: {
          emails: [user.email],
          data: {
            id: user.id,
            name: `${first_name} ${last_name}`,
            link: `${this.configService.get<string>(
              'verification_front_url',
            )}/${verificationCode.verificationToken}`,
          },
          subject: 'Welcome to Hubbers! Please verify your account.',
        },
      };

      this.mailClient.emit('send_email', payload);

      return {
        ...createTokenResponse,
        userRes,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getForgotPasswordToken(data: any): Promise<any> {
    try {
      const user = await this.findUserAccountByEmail(data.email);

      if (!user) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      const verificationCode = await firstValueFrom(
        this.tokenClient.send(
          'verification_token_create',
          JSON.stringify(user),
        ),
      );

      user.reset_password_otp = verificationCode.verificationToken;

      await this.userRepository.save(user);

      const payload: IMailPayload = {
        template: 'RESET_PASSWORD',
        payload: {
          emails: [user.email],
          data: {
            name: `${user.general_profile.first_name} ${user.general_profile.last_name}`,
            link: `${this.configService.get<string>(
              'forgot_password_front_url',
            )}/${verificationCode.verificationToken}`,
          },
          subject: 'Forgot Password',
        },
      };
      this.mailClient.emit('send_email', payload);

      return {
        status: 200,
        message: 'Forgot token sent.',
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async verifyAccount(token: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          verification_code: token,
        },
      });
      if (!user) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      if (user.verification_code === token) {
        const decode = await firstValueFrom(
          this.tokenClient.send('verification_token_decode', token),
        );
        if (!decode) {
          throw new HttpException('INVALID_TOKEN', HttpStatus.NOT_FOUND);
        }

        user.verification_code = null;
        user.status = STATUS.ACTIVE;

        await this.userRepository.save(user);

        return {
          status: 200,
          message: 'Account verified',
        };
      } else {
        throw new HttpException('INVALID_TOKEN', HttpStatus.NOT_FOUND);
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async sendAccountVerificationCode(data: any): Promise<any> {
    const user = await this.findUserAccountByEmail(data.email);

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const verificationCode = await firstValueFrom(
      this.tokenClient.send('verification_token_create', JSON.stringify(user)),
    );

    const payload: IMailPayload = {
      template: 'EMAIL_VERIFICATION',
      payload: {
        emails: [user.email],
        data: {
          id: user.id,
          name: `${user.general_profile.first_name} ${user.general_profile.last_name}`,
          link: `${this.configService.get<string>('verification_front_url')}/${
            verificationCode.verificationToken
          }`,
        },
        subject: 'Welcome to Hubbers! Please verify your account.',
      },
    };

    this.mailClient.emit('send_email', payload);

    user.verification_code = verificationCode.verificationToken;

    await this.userRepository.save(user);

    return {
      status: 200,
      message: 'Verification email sent',
    };
  }

  public async changePassword(data: ChangePasswordDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        reset_password_otp: data.token,
      },
    });

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (user.reset_password_otp === data.token) {
      user.password = bcrypt.hashSync(data.new_password, 8);
      user.hashed_refresh_token = null;
      user.reset_password_otp = null;
      await this.userRepository.save(user);

      return {
        status: 200,
        message: 'User password updated.',
      };
    } else {
      throw new HttpException('INVALID_TOKEN', HttpStatus.NOT_FOUND);
    }
  }

  public async getLinkedinData(code: string) {
    try {
      const accessTokenApi = process.env.LINKEDIN_TOKEN_API.replace(
        '{code}',
        code,
      )
        .replace('{clientId}', process.env.LINKEDIN_CLIENT_ID)
        .replace('{clientSecret}', process.env.LINKEDIN_CLIENT_SECRET)
        .replace('{redirectUri}', process.env.LINKEDIN_REDIRECT_URI);

      const accessTokenResponse: any = await axios.get(accessTokenApi);

      const accessToken: any = accessTokenResponse.data.access_token;
      const userProfileResponse: any = await axios.get(
        process.env.LINKEDIN_PROFILE_API,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'Application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userEmailAddressResponse: any = await axios.get(
        process.env.LINKEDIN_EMAIL_ADDRESS_API,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'Application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userProfile: any = userProfileResponse.data;
      const userEmailAddress: any = userEmailAddressResponse.data;
      const fName =
        userProfile && userProfile.firstName && userProfile.firstName.localized
          ? Object.values(userProfile?.firstName?.localized)[0]
          : '';
      const lName =
        userProfile && userProfile.lastName && userProfile.lastName.localized
          ? Object.values(userProfile?.lastName?.localized)[0]
          : '';
      const response = {
        firstName: fName,
        lastName: lName,
        email: userEmailAddress?.elements
          ? userEmailAddress?.elements[0]
            ? userEmailAddress?.elements[0]['handle~']?.emailAddress
            : ''
          : '',
        isLoginWithLinkedin: true,
        linkedinId: userProfile?.id,
        avatar: userProfile?.profilePicture
          ? userProfile?.profilePicture['displayImage~']?.elements
            ? userProfile?.profilePicture['displayImage~']?.elements[0]
                ?.identifiers
              ? userProfile?.profilePicture['displayImage~']?.elements[0]
                  ?.identifiers[0]?.identifier
              : ''
            : ''
          : '',
      };
      return response;
    } catch (err) {
      // tslint:disable-next-line: no-console
      return err;
    }
  }

  public async performLinkedinLogin(data: LinkedinDto) {
    try {
      const linkedinData: any = await this.getLinkedinData(data.code);
      const foundUser: any = await this.userRepository.findOne({
        where: {
          email: linkedinData?.email,
        },
      });
      if (!foundUser) {
        const pwd = await bcrypt.hashSync(
          process.env.LINKEDIN_DEFAULT_USER_PASSWORD,
          8,
        );
        const newUser = new User();
        newUser.profile_uid = await generateRandomNumber(5, true);
        newUser.email = linkedinData?.email;
        newUser.password = pwd;
        newUser.role = ROLES.STANDARD;
        newUser.status = STATUS.ACTIVE;
        newUser.is_login_with_linkedin = true;
        newUser.linkedin_id = linkedinData?.linkedinId;

        const user = await this.userRepository.save(newUser);

        const newGeneralProfile = new GeneralProfile();

        newGeneralProfile.first_name = linkedinData?.firstName;
        newGeneralProfile.last_name = linkedinData?.lastName;
        newGeneralProfile.user = user;
        newGeneralProfile.avatar = linkedinData?.avatar;

        const generalP =
          await this.generalProfileRepository.save(newGeneralProfile);
        await this.userRepository.save({
          id: user.id,
          general_profile: generalP,
        });
      }
      const checkUser: any = await this.userRepository.findOne({
        where: {
          email: linkedinData?.email,
        },
      });
      const user = await this.getUserByEmail(linkedinData?.email);
      const createTokenResponse = await firstValueFrom(
        this.tokenClient.send('token_create', JSON.stringify(checkUser)),
      );
      delete checkUser.password;
      return {
        data: encodeURIComponent(
          JSON.stringify({
            ...createTokenResponse,
            user: user,
          }),
        ),
      };
    } catch (err) {
      const response = { success: false, data: err };
      return response;
    }
  }

  public async performLinkedinLoginMobile(data: LinkedinDto) {
    try {
      const accessToken: any = data.code;
      const userProfileResponse: any = await axios.get(
        process.env.LINKEDIN_PROFILE_API,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'Application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const userEmailAddressResponse: any = await axios.get(
        process.env.LINKEDIN_EMAIL_ADDRESS_API,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'Application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userProfile: any = userProfileResponse.data;
      const userEmailAddress: any = userEmailAddressResponse.data;
      const fName =
        userProfile && userProfile.firstName && userProfile.firstName.localized
          ? Object.values(userProfile?.firstName?.localized)[0]
          : '';
      const lName =
        userProfile && userProfile.lastName && userProfile.lastName.localized
          ? Object.values(userProfile?.lastName?.localized)[0]
          : '';
      const linkedinData: any = {
        firstName: fName,
        lastName: lName,
        email: userEmailAddress?.elements
          ? userEmailAddress?.elements[0]
            ? userEmailAddress?.elements[0]['handle~']?.emailAddress
            : ''
          : '',
        isLoginWithLinkedin: true,
        linkedinId: userProfile?.id,
        avatar: userProfile?.profilePicture
          ? userProfile?.profilePicture['displayImage~']?.elements
            ? userProfile?.profilePicture['displayImage~']?.elements[0]
                ?.identifiers
              ? userProfile?.profilePicture['displayImage~']?.elements[0]
                  ?.identifiers[0]?.identifier
              : ''
            : ''
          : '',
      };
      const foundUser: any = await this.userRepository.findOne({
        where: {
          email: linkedinData?.email,
        },
      });
      if (!foundUser) {
        const pwd = await bcrypt.hashSync(
          process.env.LINKEDIN_DEFAULT_USER_PASSWORD,
          8,
        );
        const newUser = new User();
        newUser.profile_uid = await generateRandomNumber(5, true);
        newUser.email = linkedinData?.email;
        newUser.password = pwd;
        newUser.role = ROLES.STANDARD;
        newUser.status = STATUS.ACTIVE;
        newUser.is_login_with_linkedin = true;
        newUser.linkedin_id = linkedinData?.linkedinId;

        const user = await this.userRepository.save(newUser);

        const newGeneralProfile = new GeneralProfile();

        newGeneralProfile.first_name = linkedinData.firstName;
        newGeneralProfile.last_name = linkedinData?.lastName;
        newGeneralProfile.user = user;
        newGeneralProfile.avatar = linkedinData?.avatar;

        const generalP =
          await this.generalProfileRepository.save(newGeneralProfile);
        await this.userRepository.save({
          id: user.id,
          general_profile: generalP,
        });
      }
      const checkUser: any = await this.userRepository.findOne({
        where: {
          email: linkedinData?.email,
        },
      });
      const createTokenResponse = await firstValueFrom(
        this.tokenClient.send('token_create', JSON.stringify(checkUser)),
      );
      delete checkUser.password;

      return {
        ...createTokenResponse,
        ...checkUser,
      };
    } catch (err) {
      const response = { success: false, data: err };
      return response;
    }
  }
  public async performAppleLoginMobile(data: AppleDto) {
    try {
      const foundUser: any = await this.userRepository.findOne({
        where: {
          email: data.email,
        },
      });
      if (!foundUser) {
        const newUser = new User();
        newUser.profile_uid = await generateRandomNumber(5, true);
        newUser.email = data.email;
        newUser.password = data.code;
        newUser.role = ROLES.STANDARD;
        newUser.status = STATUS.ACTIVE;
        newUser.is_login_with_apple = true;
        newUser.apple_id = data.code;

        const user = await this.userRepository.save(newUser);

        const newGeneralProfile = new GeneralProfile();

        newGeneralProfile.first_name = data.first_name;
        newGeneralProfile.last_name = data.last_name;
        newGeneralProfile.user = user;

        const generalP =
          await this.generalProfileRepository.save(newGeneralProfile);
        await this.userRepository.save({
          id: user.id,
          general_profile: generalP,
        });
      }
      const checkUser: any = await this.userRepository.findOne({
        where: {
          email: data.email,
        },
        relations: ['general_profile'],
      });
      const createTokenResponse = await firstValueFrom(
        this.tokenClient.send('token_create', JSON.stringify(checkUser)),
      );
      delete checkUser.password;

      return {
        ...createTokenResponse,
        ...checkUser,
      };
    } catch (err) {
      const response = { success: false, data: err };
      return response;
    }
  }

  public async changeUserChatStatus(userId: number, status: USER_STATE) {
    try {
      return this.userRepository.update(userId, { user_state: status });
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async updateUserData(id: number, data: updateUserDto): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!user) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.CONFLICT);
      }
      await this.userRepository.update(id, data);
      return {
        message: 'User profile updated.',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async checkUserAi(id: number): Promise<any> {
    try {
      const user = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: id,
          },
        },
      });
      if (!user) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.CONFLICT);
      }
      return {
        hbb_points: user.hbb_points,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async updateUserNotification(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!user) {
        return {
          status: 500,
          message: 'user Not Found',
        };
      }
      return await this.userRepository.update(id, {
        has_new_notification: TRUE_FALSE.TRUE,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserChat(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!user) {
        return {
          status: 500,
          message: 'User Not Found',
        };
      }
      return await this.userRepository.update(id, {
        has_new_message: TRUE_FALSE.TRUE,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async generateCode(data: any) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: data.user_id,
        },
      });
      if (!user) {
        return {
          status: 500,
          message: 'user Not Found',
        };
      }

      return await this.userRepository.update(data.user_id, {
        otp: data.code,
        is_verified_id_by_code: TRUE_FALSE.FALSE,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async verifyGeneratedCode(user_id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
      });
      if (!user) {
        return {
          status: 500,
          message: 'user Not Found',
        };
      }

      return await this.userRepository.update(user_id, {
        is_verified_id_by_code: TRUE_FALSE.TRUE,
      });
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
          email,
        },
      });
    } catch (err) {
      throw err;
    }
  }
}
