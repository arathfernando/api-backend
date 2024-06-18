import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Admin from 'src/database/entities/admin.entity';
import { CreateAdminUserDto } from 'src/helper/dtos';
import { S3Service } from 'src/helper/services/s3/s3.service';
import * as bcrypt from 'bcrypt';
import { STATUS, TRUE_FALSE } from 'src/helper/constant';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import AdminRole from 'src/database/entities/admin-role.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(AdminRole)
    private readonly adminRoleRepository: Repository<AdminRole>,
    private readonly s3Service: S3Service,
  ) {}

  public async createAdmin(file: any, data: CreateAdminUserDto): Promise<any> {
    try {
      const checkUser = await this.adminRepository.findOne({
        where: {
          email: data.email,
        },
      });

      if (checkUser) {
        throw new HttpException('USER_EXISTS', HttpStatus.CONFLICT);
      }
      const hashPassword = bcrypt.hashSync(data.password, 8);

      let logo;

      if (file) {
        logo = await this.s3Service.uploadFile(file);
      }

      const newAdmin = new Admin();
      newAdmin.email = data.email;
      newAdmin.profile_image = logo ? logo.Location : null;
      newAdmin.first_name = data.first_name;
      newAdmin.last_name = data.last_name;
      newAdmin.password = hashPassword;
      if (data.admin_role) {
        newAdmin.admin_role = data.admin_role.split(',');
      }
      newAdmin.country_code = data.country_code;
      newAdmin.mobile_number = data.mobile_number;
      newAdmin.status = STATUS.ACTIVE;

      const created = await this.adminRepository.save(newAdmin);
      delete created.password;
      delete created.reset_password_otp;
      delete created.hashed_refresh_token;

      return created;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAdmin(file: any, data: any, id: number): Promise<any> {
    try {
      const user = await this.getUser(id);
      if (!user) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
      }
      let logo = null;

      if (file) {
        logo = await this.s3Service.uploadFile(file);
        data.profile_image = logo.Location;
      }
      if (data.admin_role) {
        data.admin_role = data.admin_role.split(',');
      }
      await this.adminRepository.update(id, data);

      return {
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAdminNotification(id: number) {
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!admin) {
        return {
          status: 500,
          message: 'admin Not Found',
        };
      }
      return await this.adminRepository.update(
        { status: STATUS.ACTIVE },
        {
          has_new_notification: TRUE_FALSE.TRUE,
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUser(id: number): Promise<any> {
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!admin) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      return admin;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllUsers(limit: number, page_no: number): Promise<any> {
    try {
      const skip = limit * page_no - limit;

      const users: any = await this.adminRepository.find({
        take: limit,
        skip,
      });
      for (let i = 0; i < users.length; i++) {
        if (users[i].admin_role && users[i].admin_role.length) {
          users[i].admin_role = await this.adminRoleRepository.find({
            where: {
              id: In(users[i].admin_role),
            },
          });
        }
      }

      return users;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteUser(id: number): Promise<any> {
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!admin) {
        throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
      }
      await this.adminRepository.delete(id);

      return {
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
