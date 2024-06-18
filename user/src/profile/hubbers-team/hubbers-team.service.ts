import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from 'src/app.service';
import { HubbersTeamProfile, User } from 'src/database/entities';
import { TRUE_FALSE, YES_NO } from 'src/helper/constant';
import { HubbersTeamProfileDto } from 'src/helper/dtos';
import { S3Service } from 'src/helper/service/s3/s3.service';
import { Repository } from 'typeorm';

@Injectable()
export class HubbersTeamService {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(HubbersTeamProfile)
    private readonly hubbersTeamRepository: Repository<HubbersTeamProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
  ) {}

  async createProfile(
    file: any,
    user_id: number,
    data: HubbersTeamProfileDto,
  ): Promise<any> {
    try {
      const avatar = await this.s3Service.uploadFile(file);

      await this.hubbersTeamRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      const user = await this.appService.getUserProfileById(user_id);
      const newProfile = new HubbersTeamProfile();

      newProfile.avatar = avatar.Location;
      newProfile.first_name = data.first_name;
      newProfile.last_name = data.last_name;
      newProfile.title = data.title;
      newProfile.description = data.description ? data.description : null;
      newProfile.user = user;
      newProfile.is_published = YES_NO.NO;
      newProfile.is_terminated = YES_NO.NO;
      const gpUpdated = await this.saveWithOrder(newProfile);
      await this.userRepository.update(user.id, {
        hubbers_team_profile: gpUpdated,
      });
      return gpUpdated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProfile(
    file: Express.Multer.File,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      let avatar;
      if (file) {
        avatar = await this.s3Service.uploadFile(file);
        data.avatar = avatar.Location;
      }

      const profile = await this.hubbersTeamRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!profile) {
        return {
          status: 500,
          message: 'No Hubber team profile found.',
        };
      }

      await this.hubbersTeamRepository.update(
        {
          user: {
            id: user_id,
          },
        },
        data,
      );

      return await this.hubbersTeamRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getProfile(user_id: number): Promise<any> {
    try {
      const profile = await this.hubbersTeamRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
        order: {
          order: 'ASC',
        },
      });

      if (!profile) {
        return {
          status: 500,
          message: 'No Hubber team profile found.',
        };
      }

      return profile;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createAdminHubberTeamProfile(data: any): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: data.user_id,
        },
        relations: ['general_profile', 'hubbers_team_profile'],
      });
      if (!user) {
        return {
          status: 500,
          message: 'No user found',
        };
      }
      if (user.hubbers_team_profile) {
        return {
          status: 500,
          message: 'Hubber team profile already exist.',
        };
      }
      const hubbersTeamProfile = new HubbersTeamProfile();
      hubbersTeamProfile.user = user;
      hubbersTeamProfile.avatar = user.general_profile.avatar;
      hubbersTeamProfile.first_name = user.general_profile.first_name;
      hubbersTeamProfile.last_name = user.general_profile.last_name;
      hubbersTeamProfile.title = data.title;
      hubbersTeamProfile.description = data.description
        ? data.description
        : null;
      hubbersTeamProfile.join_date = data.join_date;
      hubbersTeamProfile.termination_date = data.termination_date
        ? data.termination_date
        : null;
      hubbersTeamProfile.is_published = data.is_published;
      hubbersTeamProfile.is_terminated = data.is_terminated;
      const hubberTeamProfileData =
        await this.saveWithOrder(hubbersTeamProfile);
      await this.userRepository.update(user.id, {
        is_hubber_team: TRUE_FALSE.TRUE,
        hubbers_team_profile: hubberTeamProfileData,
      });
      return {
        status: 200,
        message: 'Hubbers team profile created successfully.',
      };
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async updateAdminHubberTeamProfile(id: number, data: any): Promise<any> {
    try {
      const hubberTeamProfile = await this.hubbersTeamRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!hubberTeamProfile) {
        return {
          status: 500,
          message: 'No Hubber team profile found.',
        };
      }
      if (data.user_id) {
        const user = await this.userRepository.findOne({
          where: {
            id: data.user_id,
          },
          relations: ['general_profile'],
        });
        if (!user) {
          return {
            status: 500,
            message: 'No user found',
          };
        }
        data.user = user;
        delete data.user_id;
      }
      await this.hubbersTeamRepository.update(id, data);
      return {
        status: 200,
        message: 'Hubbers team profile updated successfully.',
      };
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async removeHubberProfile(data: any): Promise<any> {
    try {
      const hubberTeamProfile = await this.hubbersTeamRepository.findOne({
        where: {
          user: {
            id: data,
          },
        },
        relations: ['user'],
      });
      if (!hubberTeamProfile) {
        return {
          status: 500,
          message: 'No Hubber team profile found.',
        };
      }

      await this.userRepository.update(
        { id: hubberTeamProfile.user.id },
        {
          is_hubber_team: TRUE_FALSE.FALSE,
          hubbers_team_profile: null,
        },
      );
      await this.hubbersTeamRepository.delete({
        user: {
          id: hubberTeamProfile.user.id,
        },
      });
      return {
        status: 200,
        message: 'Hubbers team profile removed successfully.',
      };
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }
  async getAdminHubberTeamProfile(data: any): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;

      const hubbersTeam = await this.hubbersTeamRepository
        .createQueryBuilder('hubbers_team_profile')
        .leftJoinAndSelect('hubbers_team_profile.user', 'user')
        .where('user.is_hubber_team = :is_hubber_team', {
          is_hubber_team: TRUE_FALSE.TRUE,
        })
        .orderBy('hubbers_team_profile.id', 'DESC')
        .take(data.limit)
        .skip(skip)
        .getMany();

      return hubbersTeam;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async updateAdminHubberTeamProfileOrder(data: any): Promise<any> {
    try {
      const base_data = await this.hubbersTeamRepository.findOne({
        where: {
          id: data.base_id,
        },
      });
      if (!base_data) {
        return {
          status: 500,
          message: 'No base data found.',
        };
      }
      const update_data = await this.hubbersTeamRepository.findOne({
        where: {
          id: data.update_id,
        },
      });
      if (!update_data) {
        return {
          status: 500,
          message: 'No update data found.',
        };
      }
      const base_order = base_data.order;
      const update_order = update_data.order;

      base_data.order = update_order;
      update_data.order = base_order;

      await this.hubbersTeamRepository.save(base_data);
      await this.hubbersTeamRepository.save(update_data);
      return {
        status: 200,
        message: 'Order updated successfully.',
      };
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async saveWithOrder(data: any): Promise<any> {
    const maxOrder = await this.hubbersTeamRepository.query(
      `SELECT MAX(psf.order) AS max_order FROM hubbers_team_profile AS psf;`,
    );
    data.order = maxOrder[0].max_order + 1;
    return await this.hubbersTeamRepository.save(data);
  }
}
