import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AppService } from 'src/app.service';
import { CreatorDto, UpdateCreatorDto } from 'src/helper/dtos';
import { CreatorProfile } from '../../database/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CreatorService {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    private readonly appService: AppService,
    @InjectRepository(CreatorProfile)
    private readonly creatorRepo: Repository<CreatorProfile>,
  ) {
    this.adminClient.connect();
  }

  async createProfile(user_id: number, data: CreatorDto): Promise<any> {
    try {
      const checkProfileExist = await this.creatorRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (checkProfileExist) {
        return {
          status: 500,
          message: 'Creator Profile Already Exists.',
        };
      }

      const user = await this.appService.getUserById(user_id);

      const creatorProf = new CreatorProfile();

      creatorProf.launching_new_product = data.launching_new_product;
      creatorProf.built_product = data.built_product;
      creatorProf.portfolio_link = data.portfolio_link;
      creatorProf.profile_tagline = data.profile_tagline;
      creatorProf.when_launching_product = data.when_launching_product;
      creatorProf.have_team = data.have_team;
      creatorProf.expertise = data.expertise;
      creatorProf.extra_expertise = data.extra_expertise
        ? data.extra_expertise
        : null;
      creatorProf.project_description = data.project_description;
      creatorProf.user = user;

      return await this.creatorRepo.save(creatorProf);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProfile(user_id: number, data: any): Promise<any> {
    try {
      const checkProfileExist = await this.creatorRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      if (!checkProfileExist) {
        return {
          status: 500,
          message: 'Creator Profile Not Exists.',
        };
      }

      await this.creatorRepo.update(
        {
          id: checkProfileExist.id,
        },
        data,
      );

      return {
        status: 200,
        message: 'Creator profile is updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getProfile(user_id: number): Promise<any> {
    try {
      const profile: any = await this.creatorRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!profile) {
        throw new HttpException(
          'CREATOR_PROFILE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      // if (profile.expertise) {
      //   const expertise = profile.expertise.split(',');
      //   const profileExpertise = [];
      //   for (let i = 0; i < expertise.length; i++) {
      //     const expertiseData = await firstValueFrom(
      //       this.adminClient.send<any>('get_expertise_by_id', expertise[i]),
      //     );
      //     profileExpertise.push(expertiseData);
      //   }
      //   profile.expertise = profileExpertise;
      // }

      return profile;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
