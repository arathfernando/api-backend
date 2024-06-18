import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app.service';
import {
  Education,
  ProfileGoal,
  SocialMedia,
  UserInterest,
  WorkExperience,
  ProfileBadge,
  GeneralProfile,
  User,
} from 'src/database/entities';
import {
  ChooseGoalDto,
  CreateGeneralProfileDto,
  EducationDto,
  SocialMediaDto,
  WorkExperienceDto,
  UpdateUserInterestDto,
  UserInterestDto,
  AddBadgeDto,
} from 'src/helper/dtos';
import {
  IEducation,
  ISocialMedia,
  IWorkExperience,
} from 'src/helper/interfaces';
import { IGeneralProfile } from 'src/helper/interfaces/IGeneralProfile';
import { S3Service } from 'src/helper/service/s3/s3.service';
import { TRUE_FALSE } from 'src/helper/constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GeneralService {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    private readonly appService: AppService,
    @InjectRepository(GeneralProfile)
    private readonly generalProfileRepository: Repository<GeneralProfile>,
    @InjectRepository(WorkExperience)
    private readonly workExperienceRepository: Repository<WorkExperience>,
    @InjectRepository(Education)
    private readonly educationRepository: Repository<Education>,
    @InjectRepository(SocialMedia)
    private readonly socialMediaRepository: Repository<SocialMedia>,
    @InjectRepository(UserInterest)
    private readonly userInterestRepository: Repository<UserInterest>,
    @InjectRepository(ProfileGoal)
    private readonly profileGoalRepository: Repository<ProfileGoal>,
    @InjectRepository(ProfileBadge)
    private readonly profileBadgeRepository: Repository<ProfileBadge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
  ) {
    this.notificationClient.connect();
    this.adminClient.connect();
    this.communityClient.connect();
  }

  async createGeneralProfile(
    file: any,
    data: CreateGeneralProfileDto,
    user_id: number,
  ): Promise<IGeneralProfile> {
    try {
      const avatar = await this.s3Service.uploadFile(file);

      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      gp.avatar = avatar.Location;
      gp.location = data.location;
      gp.latitude = data.latitude;
      gp.longitude = data.longitude;
      gp.nationality = data.nationality;
      gp.birth_date = data.birth_date;

      const gpUpdated = await this.generalProfileRepository.save(gp);
      return gpUpdated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateGeneralProfile(
    file: Express.Multer.File,
    data: any,
    user_id: number,
  ): Promise<IGeneralProfile> {
    try {
      let avatar;
      if (file) {
        avatar = await this.s3Service.uploadFile(file);
        data.avatar = avatar.Location;
      }

      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }
      if (data.walkthrough_category) {
        data.walkthrough_category = data.walkthrough_category.split(',');
      }
      await this.generalProfileRepository.update(
        {
          user: {
            id: user_id,
          },
        },
        data,
      );

      return await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async getGeneralProfile(user_id: number): Promise<any> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
        relations: [
          'user',
          'user.creator_profile',
          'user.expert_profile',
          'user.investor_profile',
          'user.hubbers_team_profile',
          'user.teacher_profile',
          'work_experience',
          'education',
          'social_media',
          'profile_goal',
          'profile_badge',
          'interest',
        ],
      });

      if (!gp) {
        return {
          status: 500,
          message: `User not found`,
        };
      }

      delete gp.user.password;
      delete gp.user.verification_code;
      delete gp.user.reset_password_otp;
      delete gp.user.linkedin_id;
      delete gp.user.is_login_with_linkedin;

      const newGp: any = gp;

      if (newGp.social_media && newGp.social_media.length > 0) {
        for (let i = 0; i < newGp.social_media.length; i++) {
          let social: any;
          if (newGp.social_media[i].social_media_id) {
            social = await firstValueFrom(
              this.adminClient.send(
                'get_media',
                newGp.social_media[i].social_media_id,
              ),
            );
          }
          newGp.social_media[i].social_media = social;
        }
      }

      if (gp.walkthrough_category && gp.walkthrough_category.length > 0) {
        let walkthroughCategory: any;
        if (newGp.walkthrough_category) {
          walkthroughCategory = await firstValueFrom(
            this.adminClient.send(
              'get_walkthrough_category_by_ids',
              JSON.stringify(newGp.walkthrough_category),
            ),
          );
        }
        newGp.walkthrough_category = walkthroughCategory;
      }

      if (gp.profile_badge && gp.profile_badge.length > 0) {
        for (let i = 0; i < newGp.profile_badge.length; i++) {
          let badge: any;
          if (newGp.profile_badge[i].id) {
            badge = await firstValueFrom(
              this.adminClient.send(
                'get_badge_by_id',
                newGp.profile_badge[i].badge_id,
              ),
            );
          }
          newGp.profile_badge[i].badge_id = badge;
        }
      }

      if (gp.profile_goal && gp.profile_goal.length > 0) {
        for (let i = 0; i < newGp.profile_goal.length; i++) {
          let goal: any;
          if (newGp.profile_goal[i].id) {
            goal = await firstValueFrom(
              this.adminClient.send(
                'get_goal_by_id',
                newGp.profile_goal[i].goal_id,
              ),
            );
          }
          newGp.profile_goal[i].goal_id = goal;
        }
      }

      const returnD = [];
      if (gp.interest && gp.interest.length > 0) {
        for (let i = 0; i < gp.interest.length; i++) {
          const interest_cate = await firstValueFrom(
            this.adminClient.send(
              'get_basic_type_category',
              gp.interest[i].type_category,
            ),
          );
          const interests = await firstValueFrom(
            this.adminClient.send(
              'get_basic_type_ids',
              JSON.stringify(gp.interest[i].interests),
            ),
          );

          returnD.push({
            type_category: interest_cate,
            interests,
          });
        }
        newGp.interest = returnD;
      }

      const userInvest = await firstValueFrom(
        this.adminClient.send<any>(
          'get_user_investment_by_zone',
          JSON.stringify({ user_id: user_id, zone_id: 0 }),
        ),
      );
      let total_user_share = 0;
      let total_user_share_value = 0;
      let current_value_of_share = 0;
      if (!userInvest.status && !userInvest.message) {
        for (let i = 0; i < userInvest.length; i++) {
          total_user_share = total_user_share + userInvest[i].share_qty;
          total_user_share_value =
            total_user_share_value +
            userInvest[i].share_qty * parseFloat(userInvest[i].share_value);
          current_value_of_share =
            userInvest[i].price_to_date / userInvest[i].share_qty;
        }
      }
      newGp.current_value_of_hbs = current_value_of_share * total_user_share;
      return newGp;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async getWorkExperience(user_id: number): Promise<IWorkExperience[]> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      const newGp: any = gp;
      const we = await this.workExperienceRepository.find({
        where: {
          general_profile: {
            id: newGp.id,
          },
        },
      });

      if (!we) {
        throw new HttpException(
          'WORK_EXPERIENCE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      return we;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createWorkExperience(
    data: WorkExperienceDto,
    user_id: number,
  ): Promise<IWorkExperience> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const user = await this.appService.getUserById(user_id);
      const workExp = new WorkExperience();

      workExp.company_name = data.company_name;
      workExp.job_title = data.job_title;
      workExp.start_date = data.start_date;
      workExp.end_date = data.end_date;
      workExp.currently_working = data.currently_working;
      workExp.description = data.description;
      workExp.general_profile = user.general_profile;

      return await this.workExperienceRepository.save(workExp);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateWorkExperience(
    id: number,
    data: WorkExperienceDto,
    user_id: number,
  ): Promise<IWorkExperience[]> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.workExperienceRepository.update(id, data);
      return await await this.workExperienceRepository.find({
        where: {
          general_profile: {
            id: gp.id,
          },
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async deleteWorkExperience(id: number, user_id: number) {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const workExp = await this.workExperienceRepository.findOne({
        where: {
          id: id,
          general_profile: {
            id: gp.id,
          },
        },
      });

      if (!workExp) {
        throw new HttpException(
          'WORK_EXPERIENCE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      await this.workExperienceRepository.delete(id);

      return {
        status: HttpStatus.OK,
        message: 'Work Experience Deleted Successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateAdminWorkExperience(
    data: any,
    user_id: number,
  ): Promise<IWorkExperience[]> {
    try {
      const gp = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
        relations: ['general_profile'],
      });
      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.workExperienceRepository.delete({
        general_profile: {
          id: gp.general_profile.id,
        },
      });
      const work_exp = [...data.work_experience];
      for (let i = 0; i < work_exp.length; i++) {
        const element = work_exp[i];
        const work_experience = new WorkExperience();
        work_experience.company_name = element.company_name;
        work_experience.job_title = element.job_title;
        work_experience.start_date = element.start_date;
        work_experience.end_date = element.end_date;
        work_experience.currently_working = element.currently_working;
        work_experience.description = element.description;
        work_experience.general_profile = gp.general_profile;
        await this.workExperienceRepository.save(work_experience);
      }
      return await this.workExperienceRepository.find({
        where: {
          general_profile: {
            id: gp.general_profile.id,
          },
        },
      });
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async getEducation(user_id: number): Promise<IEducation[]> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      const newGp: any = gp;
      const edu = await this.educationRepository.find({
        where: {
          general_profile: {
            id: newGp.id,
          },
        },
      });

      if (!edu) {
        throw new HttpException('EDUCATION_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      return edu;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createEducation(
    data: EducationDto,
    user_id: number,
  ): Promise<IEducation> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const user = await this.appService.getUserById(user_id);

      const edu = new Education();
      edu.institute_name = data.institute_name;
      edu.degree = data.degree;
      edu.graduation_year = data.graduation_year;
      edu.general_profile = user.general_profile;

      return await this.educationRepository.save(edu);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateEducation(
    id: number,
    data: EducationDto,
    user_id: number,
  ): Promise<IEducation[]> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.educationRepository.update(id, data);

      return await this.educationRepository.find({
        where: {
          general_profile: {
            id: gp.id,
          },
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async deleteEducation(id: number, user_id: number) {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const education = await this.educationRepository.findOne({
        where: {
          id: id,
          general_profile: {
            id: gp.id,
          },
        },
      });

      if (!education) {
        throw new HttpException('EDUCATION_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.educationRepository.delete(id);

      return {
        status: HttpStatus.OK,
        message: 'Education Deleted Successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateAdminEducation(
    data: any,
    user_id: number,
  ): Promise<IEducation[]> {
    try {
      const gp = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
        relations: ['general_profile'],
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.educationRepository.delete({
        general_profile: {
          id: gp.general_profile.id,
        },
      });
      const education = [...data.education];
      for (let i = 0; i < education.length; i++) {
        const education_data = new Education();
        education_data.degree = education[i].degree;
        education_data.graduation_year = education[i].graduation_year;
        education_data.institute_name = education[i].institute_name;
        education_data.general_profile = gp.general_profile;
        await this.educationRepository.save(education_data);
      }
      return await this.educationRepository.find({
        where: {
          general_profile: {
            id: gp.general_profile.id,
          },
        },
      });
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async getSocialMedia(user_id: number): Promise<ISocialMedia[]> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      const newGp: any = gp;
      const socialMedia = await this.socialMediaRepository.find({
        where: {
          general_profile: {
            id: newGp.id,
          },
        },
      });

      if (!socialMedia) {
        throw new HttpException('SOCIAL_MEDIA_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const sm: any = [...socialMedia];

      for (let i = 0; i < sm.length; i++) {
        const social = await firstValueFrom(
          this.adminClient.send('get_media', sm[i].social_media_id),
        );

        sm[i].social_media = social;
      }

      return sm;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createSocialMedia(
    data: SocialMediaDto,
    user_id: number,
  ): Promise<ISocialMedia> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const user = await this.appService.getUserById(user_id);

      const sm = new SocialMedia();
      sm.social_media_id = data.media_id;
      sm.link = data.link;
      sm.general_profile = user.general_profile;
      const created = await this.socialMediaRepository.save(sm);

      const createdRes: any = created;
      const social = await firstValueFrom(
        this.adminClient.send('get_media', createdRes.social_media_id),
      );
      createdRes.social = social;

      return created;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateSocialMedia(
    id: number,
    data: any,
    user_id: number,
  ): Promise<ISocialMedia[]> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.socialMediaRepository.update(id, data);

      // const social = await firstValueFrom(
      //   this.adminClient.send('get_media', sm[i].social_media_id),
      // );

      // sm[i].social_media = social;

      const res = await this.getSocialMedia(user_id);
      return res;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async deleteSocialMedia(id: number, user_id: number) {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const education = await this.socialMediaRepository.findOne({
        where: {
          id: id,
          general_profile: {
            id: gp.id,
          },
        },
      });

      if (!education) {
        throw new HttpException('SOCIAL_MEDIA_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.socialMediaRepository.delete(id);

      return {
        status: HttpStatus.OK,
        message: 'Social Media Deleted Successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateAdminSocialMedia(
    data: any,
    user_id: number,
  ): Promise<ISocialMedia[]> {
    try {
      const gp = await this.userRepository.findOne({
        where: {
          id: user_id,
        },
        relations: ['general_profile'],
      });
      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.socialMediaRepository.delete({
        general_profile: {
          id: gp.general_profile.id,
        },
      });
      const social = [...data.social_media];
      for (let i = 0; i < social.length; i++) {
        social[i];
        const social_media = new SocialMedia();
        social_media.social_media_id = social[i].media_id;
        social_media.link = social[i].link;
        social_media.general_profile = gp.general_profile;
        await this.socialMediaRepository.save(social_media);
      }
      // const social = await firstValueFrom(
      //   this.adminClient.send('get_media', sm[i].social_media_id),
      // );

      // sm[i].social_media = social;

      const res = await this.getSocialMedia(user_id);
      return res;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async getUserInterests(user_id: number): Promise<any> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const userInterest = await this.userInterestRepository.find({
        where: {
          general_profile: {
            id: gp.id,
          },
        },
      });
      if (!userInterest || userInterest.length === 0) {
        throw new HttpException('INTEREST_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const returnD = [];
      for (let i = 0; i < userInterest.length; i++) {
        const interest_cate = await firstValueFrom(
          this.adminClient.send(
            'get_basic_type_category',
            userInterest[i].type_category,
          ),
        );
        for (let j = 0; j < userInterest[i].interests.length; j++) {
          const element = userInterest[i].interests[j];
          const interests = await firstValueFrom(
            this.adminClient.send(
              'get_basic_type_ids',
              JSON.stringify([element]),
            ),
          );
          returnD.push({
            type_category: interest_cate,
            interests,
          });
        }
      }

      return returnD;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createUserInterest(
    data: UserInterestDto,
    user_id: number,
  ): Promise<any> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.userInterestRepository.delete({
        general_profile: {
          id: gp.id,
        },
      });

      for (let i = 0; i < data.interests.length; i++) {
        const ui = new UserInterest();
        ui.type_category = data.interests[i].type_category;
        ui.interests = data.interests[i].interests;
        ui.general_profile = gp;
        await this.userInterestRepository.save(ui);
      }

      const userInt = await this.userInterestRepository.find({
        where: {
          general_profile: {
            id: gp.id,
          },
        },
      });
      const interestReturn: any = [];
      for (let i = 0; i < userInt.length; i++) {
        const interest_cate = await firstValueFrom(
          this.adminClient.send(
            'get_basic_type_category',
            userInt[i].type_category,
          ),
        );

        const interests = await firstValueFrom(
          this.adminClient.send(
            'get_basic_type_ids',
            JSON.stringify(userInt[i].interests),
          ),
        );
        interestReturn.push({
          type_category: interest_cate,
          interests,
        });
      }

      return interestReturn;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateUserInterest(
    data: UpdateUserInterestDto,
    user_id: number,
  ): Promise<any> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      for (let i = 0; i < data.interests.length; i++) {
        const interest = await this.userInterestRepository.findOne({
          where: {
            type_category: data.interests[i].type_category,
            general_profile: {
              id: gp.id,
            },
          },
        });

        if (interest) {
          await this.userInterestRepository.update(interest.id, {
            interests: data.interests[i].interests,
          });
        } else {
          const ui = new UserInterest();
          ui.type_category = data.interests[i].type_category;
          ui.interests = data.interests[i].interests;
          ui.general_profile = gp;
          await this.userInterestRepository.save(ui);
        }
      }

      return await this.getUserInterests(user_id);
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async deleteInterest(category_id: any): Promise<any> {
    try {
      await this.userInterestRepository.delete({
        type_category: category_id,
      });
      return {
        message: 'Interest deleted successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  async getGoals(): Promise<any> {
    try {
      const goals = await firstValueFrom(
        this.adminClient.send('get_all_goals', {}),
      );

      return goals;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addGoals(data: ChooseGoalDto, user_id: number): Promise<any> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!gp) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const goals = await this.profileGoalRepository.find({
        where: {
          general_profile: {
            id: gp.id,
          },
        },
      });

      if (goals.length > 0) {
        await this.profileGoalRepository.delete({
          general_profile: {
            id: gp.id,
          },
        });
      }

      gp.hbb_points = 0;

      if (data.goals.length > 0) {
        for (let i = 0; i < data.goals.length; i++) {
          const pg = new ProfileGoal();
          pg.goal_id = data.goals[i];
          pg.general_profile = gp;
          await this.profileGoalRepository.save(pg);
        }
      }

      // If user selects goal then he will be credited with 5 HBB
      gp.hbb_points = 5;

      await this.generalProfileRepository.update(gp.id, gp);

      const updatedGp = await this.getGeneralProfile(user_id);
      return updatedGp;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async addBadge(data: AddBadgeDto, user_id: number): Promise<any> {
    try {
      const gp = await this.generalProfileRepository.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
        relations: ['user', 'profile_badge'],
      });

      const badge = await firstValueFrom(
        this.adminClient.send('get_badge_by_id', data.badge),
      );
      if (badge) {
        const profile_badge = new ProfileBadge();
        profile_badge.badge_id = data.badge;
        profile_badge.general_profile = gp;
        await this.profileBadgeRepository.save(profile_badge);
        const payloadData: any = { ...profile_badge };
        payloadData.badge_id = badge;
        const joinRequestNotification = {
          notification_from: 0,
          notification_to: user_id,
          payload: payloadData,
          content: 'Your badges are updated.',
          type: 'BADGE_NOTIFICATION',
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );

        if (data.need_to_post == TRUE_FALSE.TRUE) {
          const communities = await firstValueFrom(
            this.communityClient.send('get_community_by_user_id', user_id),
          );
          if (!communities.status && !communities.message) {
            for (let i = 0; i < communities.length; i++) {
              const post_data = {
                content: data.post_description,
                created_by: user_id,
                id: communities[i].community.id,
                post_location: 'COMMUNITY',
                post_status: 'PUBLISHED',
                is_share: 'FALSE',
              };
              const community = await firstValueFrom(
                this.communityClient.send(
                  'create_post',
                  JSON.stringify(post_data),
                ),
              );
              if (community.status && community.status == 500) {
                return {
                  status: 500,
                  message: 'No Community found.',
                };
              }
            }
          }
        }
        return {
          status: 200,
          message: 'Badge is added to user profile.',
        };
      } else {
        return {
          status: 500,
          message: 'No badge found.',
        };
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
