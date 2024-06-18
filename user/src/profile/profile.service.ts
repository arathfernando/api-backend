import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from 'src/app.service';
import {
  CreatorProfile,
  ExpertProfile,
  HubbersTeamProfile,
  InvestorProfile,
  TeacherProfile,
  User,
} from 'src/database/entities';
import { SelectProfileDto } from 'src/helper/dtos';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(CreatorProfile)
    private readonly creatorProfileRepo: Repository<CreatorProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ExpertProfile)
    private readonly expertProfileRepo: Repository<ExpertProfile>,
    @InjectRepository(InvestorProfile)
    private readonly investorProfileRepo: Repository<InvestorProfile>,
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
    @InjectRepository(HubbersTeamProfile)
    private readonly hubbersTeamRepo: Repository<HubbersTeamProfile>,
    private readonly appService: AppService,
  ) {}

  public async createEmptyProfile(
    data: SelectProfileDto,
    user_id: number,
  ): Promise<any> {
    try {
      const user = await this.appService.getUserProfileById(user_id);

      data.profile_types.forEach(async (element) => {
        if (element === 'CREATOR') {
          const creatorProfile = new CreatorProfile();
          creatorProfile.user = user;

          const created = await this.creatorProfileRepo.save(creatorProfile);
          user.creator_profile = created;

          await this.userRepository.save(user);
        }

        if (element === 'EXPERT') {
          const expertProfile = new ExpertProfile();
          expertProfile.user = user;

          const created = await this.expertProfileRepo.save(expertProfile);
          user.expert_profile = created;

          await this.userRepository.save(user);
        }

        if (element === 'INVESTOR') {
          const investorProfile = new InvestorProfile();
          investorProfile.user = user;

          const created = await this.investorProfileRepo.save(investorProfile);

          user.investor_profile = created;
          await this.userRepository.save(user);
        }

        if (element === 'HUBBERS_TEAM') {
          const hubbersProfile = new HubbersTeamProfile();
          hubbersProfile.user = user;

          const created = await this.hubbersTeamRepo.save(hubbersProfile);

          user.hubbers_team_profile = created;
          await this.userRepository.save(user);
        }
        if (element === 'TEACHER') {
          const teacherProfile = new TeacherProfile();
          teacherProfile.user = user;
          const created =
            await this.teacherProfileRepository.save(teacherProfile);
          user.teacher_profile = created;
          await this.userRepository.save(user);
        }
      });

      return {
        status: 200,
        message: 'Profile created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserProfiles(user_id: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
      });

      const creatorProfile = await this.creatorProfileRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (creatorProfile) {
        user.creator_profile = creatorProfile;
      }

      const expertProfile = await this.expertProfileRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (expertProfile) {
        user.expert_profile = expertProfile;
      }

      const investorProfile = await this.investorProfileRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (investorProfile) {
        user.investor_profile = investorProfile;
      }

      const teacherProfile = await this.teacherProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (teacherProfile) {
        user.teacher_profile = teacherProfile;
      }

      const hubbersTeamProfile = await this.hubbersTeamRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (hubbersTeamProfile) {
        user.hubbers_team_profile = hubbersTeamProfile;
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
