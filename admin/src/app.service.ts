import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import Admin from './database/entities/admin.entity';
import { ADMIN_ROLES, STATUS } from './helper/constant';
import { LoginDto } from './helper/dtos';
import * as bcrypt from 'bcrypt';
import { IMailPayload } from './helper/interfaces';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './helper/dtos/change-password.dto';
import { In, Repository } from 'typeorm';
import { UpdateUserPasswordDto } from './helper/dtos/update-admin-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import AdminRole from './database/entities/admin-role.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(AdminRole)
    private readonly adminRoleRepository: Repository<AdminRole>,
    @Inject('TOKEN_SERVICE') private readonly tokenClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    private configService: ConfigService,
  ) {
    this.mailClient.connect();
    this.tokenClient.connect();
  }

  public async adminLogin(data: LoginDto) {
    try {
      const { email, password } = data;
      const checkUser = await this.adminRepository.findOne({
        where: {
          email: email,
        },
      });

      if (!checkUser) {
        throw new HttpException(
          'USER_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const passwordIsValid = bcrypt.compareSync(password, checkUser.password);

      if (!passwordIsValid == true) {
        throw new HttpException('INVALID_PASSWORD', HttpStatus.CONFLICT);
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
      throw new InternalServerErrorException(e);
    }
  }

  public async adminSignup(data: any) {
    try {
      const { email, password, first_name, last_name } = data;
      const checkUser = await this.adminRepository.findOne({
        where: {
          email: email,
        },
      });

      if (checkUser) {
        throw new HttpException('USER_EXISTS', HttpStatus.CONFLICT);
      }
      const hashPassword = bcrypt.hashSync(password, 8);

      const newUser = new Admin();
      newUser.email = data.email;
      newUser.mobile_number = data.mobile_number;
      newUser.country_code = data.country_code;
      newUser.password = hashPassword;
      newUser.first_name = first_name.trim();
      newUser.last_name = last_name.trim();
      newUser.role = ADMIN_ROLES.SUPER_ADMIN;
      newUser.status = STATUS.ACTIVE;

      const user = await this.adminRepository.save(newUser);
      const createTokenResponse = await firstValueFrom(
        this.tokenClient.send('token_create', JSON.stringify(user)),
      );

      await this.adminRepository.save({
        id: user.id,
        hashed_refresh_token: bcrypt.hashSync(
          createTokenResponse.refreshToken,
          8,
        ),
      });

      const userRes = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      };

      return {
        ...createTokenResponse,
        userRes,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getUsers(user_id: number): Promise<any> {
    try {
      const users: any = await this.adminRepository.findOne({
        where: {
          id: user_id,
        },
      });
      if (users.admin_role && users.admin_role.length) {
        users.admin_role = await this.adminRoleRepository.find({
          where: {
            id: In(users.admin_role),
          },
        });
      }
      return users;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getForgotPasswordToken(data: any): Promise<any> {
    try {
      const user = await this.adminRepository.findOne({
        where: {
          email: data.email,
        },
      });

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

      await this.adminRepository.save(user);
      const payload: IMailPayload = {
        template: 'RESET_PASSWORD',
        payload: {
          emails: [user.email],
          data: {
            name: `${user.first_name} ${user.last_name}`,
            link: `${this.configService.get<string>(
              'forgot_password_front_url',
            )}?token=${verificationCode.verificationToken}`,
          },
          subject: 'Forgot Password',
        },
      };
      this.mailClient.emit('send_email', payload);

      return {
        status: 200,
        message: 'FORGOT_TOKEN_SENT',
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async updateUserPassword(
    data: UpdateUserPasswordDto,
    user_id: number,
  ) {
    try {
      const checkPassword = await this.adminRepository.findOne({
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
      await this.adminRepository.update(
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

  public async changePassword(data: ChangePasswordDto): Promise<any> {
    const user = await this.adminRepository.findOne({
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
      await this.adminRepository.save(user);

      return {
        status: 200,
        message:
          'Your password is updated, Please login back with new password',
      };
    } else {
      throw new HttpException('INVALID_TOKEN', HttpStatus.NOT_FOUND);
    }
  }
}
