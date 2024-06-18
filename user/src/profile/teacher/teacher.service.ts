import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from 'src/app.service';
import { TeacherProfile, User } from 'src/database/entities';
import { TeacherDto, UpdateTeacherDto } from 'src/helper/dtos';
import { Repository } from 'typeorm';

@Injectable()
export class TeacherService {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    private readonly appService: AppService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
  ) {
    this.adminClient.connect();
  }

  async createProfile(user_id: number, data: TeacherDto): Promise<any> {
    try {
      const checkProfileExist = await this.teacherProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (checkProfileExist) {
        return {
          status: 500,
          message: 'Teacher profile already exist.',
        };
      }
      const user = await this.appService.getUserProfileById(user_id);

      const expertProf = new TeacherProfile();

      expertProf.experience_teacher = data.experience_teacher
        ? data.experience_teacher
        : null;
      expertProf.language = data.language ? data.language : null;
      expertProf.description = data.description ? data.description : null;
      expertProf.have_geo_preference = data.have_geo_preference;
      expertProf.geo_preference = data.geo_preference
        ? data.geo_preference
        : data.geo_preference;
      expertProf.city = data.city ? data.city : data.city;
      expertProf.user = user;

      const gpUpdated = await this.teacherProfileRepository.save(expertProf);
      await this.userRepository.update(user.id, {
        teacher_profile: gpUpdated,
      });
      return gpUpdated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProfile(user_id: number, data: UpdateTeacherDto): Promise<any> {
    try {
      const checkProfileExist = await this.teacherProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!checkProfileExist) {
        return {
          status: 500,
          message: 'Teacher profile not exist.',
        };
      }

      await this.teacherProfileRepository.update(
        {
          user: {
            id: user_id,
          },
        },
        data,
      );

      return {
        status: 200,
        message: 'Teacher profile is updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getProfile(data: any): Promise<any> {
    try {
      const profile = await this.teacherProfileRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
      });

      if (!profile) {
        return {
          status: 500,
          message: 'Teacher profile not exist.',
        };
      }
      return profile;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
