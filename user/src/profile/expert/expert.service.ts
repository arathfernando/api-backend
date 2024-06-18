/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app.service';
import { ExpertProfile, UserPortfolio } from 'src/database/entities';
import { ExpertProfileReaction } from 'src/database/entities/expertise-reaction.entity';
import {
  EXPERT_FILTER,
  EXPERT_REVIEW_SORT_BY,
  EXPERT_SORT,
  PORTFOLIO_TYPE,
} from 'src/helper/constant';
import {
  CreateUserPortFolioDTO,
  ExpertDto,
  UpdateExpertDto,
  UpdateUserPortFolioDTO,
  CreateExpertProfileReactionDto,
  ExpertFilterDto,
  ExpertReviewFilterDto,
} from 'src/helper/dtos';
import { In, Repository } from 'typeorm';

@Injectable()
export class ExpertService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,

    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    private readonly appService: AppService,
    @InjectRepository(ExpertProfile)
    private readonly expertRepo: Repository<ExpertProfile>,
    @InjectRepository(UserPortfolio)
    private readonly userPortfolioRepository: Repository<UserPortfolio>,
    @InjectRepository(ExpertProfileReaction)
    private readonly expertProfileReactionRepository: Repository<ExpertProfileReaction>,
  ) {
    this.adminClient.connect();
  }

  async createProfile(user_id: number, data: ExpertDto): Promise<any> {
    try {
      const checkProfileExist = await this.expertRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (checkProfileExist) {
        throw new HttpException(
          'EXPERT_PROFILE_ALREADY_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      const user = await this.appService.getUserById(user_id);

      const expertProf = new ExpertProfile();

      expertProf.expertise = data.expertise;
      expertProf.extra_expertise = data.extra_expertise
        ? data.extra_expertise
        : null;
      expertProf.skills = data.skills;
      expertProf.rate_currency = data.rate_currency;
      expertProf.profile_tagline = data.profile_tagline;
      expertProf.charge_per_hour = data.charge_per_hour;
      expertProf.time_availability = data.time_availability;
      expertProf.hour_per_week = data.hour_per_week ? data.hour_per_week : null;
      expertProf.want_to_earn_hbb = data.want_to_earn_hbb;
      expertProf.portfolio_link = data.portfolio_link
        ? data.portfolio_link
        : null;
      expertProf.description = data.description;
      expertProf.user = user;

      return await this.expertRepo.save(expertProf);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProfile(user_id: number, data: UpdateExpertDto): Promise<any> {
    try {
      const checkProfileExist = await this.expertRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!checkProfileExist) {
        throw new HttpException(
          'EXPERT_PROFILE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      await this.expertRepo.update(
        {
          user: {
            id: user_id,
          },
        },
        data,
      );

      return {
        status: 200,
        message: 'Expert profile is updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getProfile(user_id: number): Promise<any> {
    try {
      const profile: any = await this.expertRepo.findOne({
        where: {
          user: {
            id: user_id,
          },
        },
      });

      if (!profile) {
        throw new HttpException(
          'EXPERT_PROFILE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      // const currencyData = await firstValueFrom(
      //   this.adminClient.send<any>('get_currency_by_id', profile.rate_currency),
      // );
      // profile.rate_currency = currencyData;
      // if (profile.expertise != '') {
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
  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }
  public async getJobSkillById(ids: number[]): Promise<any> {
    const jobSkill = await firstValueFrom(
      this.adminClient.send<any>('get_skill_by_ids', JSON.stringify(ids)),
    );

    return jobSkill;
  }

  async getAllProfile(
    data: ExpertFilterDto,
    pagination: any,
    user_id: number,
  ): Promise<any> {
    try {
      const whereConn: any = {
        where: {},
        order: {
          id: 'ASC',
        },
        take: pagination.take,
        skip: pagination.skip,
        relations: ['user', 'user.general_profile'],
      };

      if (data.expert_filter == EXPERT_FILTER.RECENTLY_JOINED) {
        whereConn.orderBy = {
          id: 'DESC',
        };
      }
      if (data.expert_filter == EXPERT_FILTER.RECENTLY_VIEWED) {
      }
      if (data.expert_filter == EXPERT_FILTER.ALL) {
      }
      if (data.expert_filter == EXPERT_FILTER.JUST_ADDED) {
        whereConn.orderBy = {
          id: 'DESC',
        };
      }
      if (data.expert_filter == EXPERT_FILTER.MOST_POPULAR) {
        const user_id = [];
        const enroll = await this.expertRepo
          .query(`SELECT over_all_rating,expertise_user_id 
      FROM user_expertise_review
      ORDER BY over_all_rating DESC
      `);

        for (let i = 0; i < enroll.length; i++) {
          user_id.includes(enroll[i].expertise_user_id)
            ? ''
            : user_id.push(enroll[i].expertise_user_id);
        }
        whereConn.where.user = {
          id: In(user_id),
        };
      }
      if (data.expert_filter == EXPERT_FILTER.SAVED_JOBS) {
      }
      if (data.expert_filter == EXPERT_FILTER.TRENDING) {
        const user_id = [];
        const enroll = await this.expertRepo
          .query(`SELECT over_all_rating,expertise_user_id 
      FROM user_expertise_review
      ORDER BY over_all_rating DESC
      `);

        for (let i = 0; i < enroll.length; i++) {
          user_id.includes(enroll[i].expertise_user_id)
            ? ''
            : user_id.push(enroll[i].expertise_user_id);
        }
        whereConn.where.user = {
          id: In(user_id),
        };
      }
      if (data.expert_filter == EXPERT_FILTER.RELATED_JOBS) {
      }
      if (data.expert_filter == EXPERT_FILTER.MY_JOBS) {
        whereConn.where.user = {
          id: user_id,
        };
      }
      if (data.sort == EXPERT_SORT.DATE) {
        whereConn.order = {
          createdAt: 'DESC',
        };
      }
      if (data.search) {
        const userData = await this.expertRepo.query(
          `SELECT * FROM general_profile WHERE LOWER(first_name) LIKE LOWER('%${data.search}%') OR LOWER(last_name) LIKE LOWER('%${data.search}%')`,
        );
        const userIds = await this.arrayColumn(userData, 'user_id');
        whereConn.where.user = {
          id: In(userIds),
        };
      }
      if (data.skill) {
        const expert = await this.expertRepo
          .createQueryBuilder('expert')
          .andWhere(':skill = ANY(expert.skills)', {
            skill: `${data.skill}`,
          })
          .getMany();
        const userIds = await this.arrayColumn(expert, 'id');
        whereConn.where.id = In(userIds);
      }
      const profile: any = await this.expertRepo.find(whereConn);
      const total = await this.expertRepo.count({
        where: { ...whereConn.where },
      });
      const totalPages = Math.ceil(total / data.limit);

      if (!profile.length) {
        throw new HttpException(
          'EXPERT_PROFILE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }
      for (let i = 0; i < profile.length; i++) {
        let allRating = 0;
        if (profile[i].goals) {
          profile[i].goals = await firstValueFrom(
            this.adminClient.send<any>(
              'get_goal_by_ids',
              JSON.stringify(profile[i].goals),
            ),
          );
        }
        if (profile[i].rate_currency) {
          profile[i].rate_currency = await firstValueFrom(
            this.adminClient.send<any>('get_currency_by_id', {
              id: profile[i].rate_currency,
            }),
          );
        }
        if (profile[i].skills) {
          profile[i].skills = await this.getJobSkillById(profile[i].skills);
        }
        const current_user_reaction_status =
          await this.expertProfileReactionRepository.findOne({
            where: {
              user: { id: profile[i].user.id },
              created_by: user_id,
            },
            order: {
              id: 'DESC',
            },
          });

        profile[i].current_user_reaction_status = current_user_reaction_status
          ? current_user_reaction_status
          : [];
        const reviews = await this.expertRepo.query(
          `SELECT * FROM user_expertise_review WHERE expertise_user_id = ${profile[i].user.id}`,
        );
        profile[i].reviews = reviews;

        const review_count = await this.expertRepo.query(
          `SELECT COUNT(*) AS count FROM user_expertise_review WHERE expertise_user_id = ${profile[i].user.id}`,
        );

        const reviewCount = review_count;
        for (let j = 0; j < profile[i].reviews.length; j++) {
          allRating =
            allRating + parseInt(profile[i].reviews[j].over_all_rating);
        }

        const reviewCounts = parseInt(reviewCount[0].count);
        const reviewer = await this.expertRepo
          .query(`SELECT created_by , COUNT(created_by) as total
        FROM user_expertise_review
        WHERE expertise_user_id = ${profile[i].user.id}
        GROUP BY created_by
        ORDER BY total DESC
        `);
        profile[i].reviewer_count = reviewer.length;
        profile[i].review_count = allRating / reviewCounts;
      }
      return {
        data: profile,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getExpertProfile(data: number, user_id: number): Promise<any> {
    try {
      let allRating = 0;
      const whereConn: any = {
        where: {
          id: data,
        },
        relations: [
          'user',
          'user.general_profile',
          'user.general_profile.profile_goal',
        ],
      };
      const profile: any = await this.expertRepo.findOne(whereConn);
      if (!profile) {
        throw new HttpException(
          'EXPERT_PROFILE_NOT_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      if (profile.skills) {
        profile.skills = await this.getJobSkillById(profile.skills);
      }
      profile.current_user_proposal_status = await this.expertRepo.query(
        `SELECT * FROM user_expertise_proposal WHERE created_by = ${user_id} AND user_id = ${data}`,
      );
      const current_user_reaction_status =
        await this.expertProfileReactionRepository.findOne({
          where: {
            created_by: user_id,
            user: profile.user,
          },
        });
      profile.current_user_reaction_status = current_user_reaction_status
        ? current_user_reaction_status
        : {};
      profile.portfolio = await this.userPortfolioRepository.find({
        where: {
          user: profile.user,
          portfolio_type: PORTFOLIO_TYPE.EXPERT,
        },
      });
      if (profile.portfolio.length) {
        for (let i = 0; i < profile.portfolio.length; i++) {
          profile.portfolio[i].skills = await this.getJobSkillById(
            profile.portfolio[i].skills,
          );
        }
      }
      const reviews = await this.expertRepo.query(
        `SELECT * FROM user_expertise_review WHERE expertise_user_id = ${profile.user.id}`,
      );
      profile.reviews = reviews;

      const review_count = await this.expertRepo.query(
        `SELECT COUNT(*) AS count FROM user_expertise_review WHERE expertise_user_id = ${profile.user.id}`,
      );

      const reviewCount = review_count;
      for (let i = 0; i < profile.reviews.length; i++) {
        allRating = allRating + parseInt(profile.reviews[i].over_all_rating);
      }

      const reviewCounts = parseInt(reviewCount[0].count);

      const reviewer = await this.expertRepo
        .query(`SELECT created_by , COUNT(created_by) as total
        FROM user_expertise_review
        WHERE expertise_user_id = ${profile.user.id}
        GROUP BY created_by
        ORDER BY total DESC
        `);

      profile.review_count =
        allRating / reviewCounts ? allRating / reviewCounts : 0;
      profile.reviewer_count = reviewer.length;
      if (profile.user.general_profile.profile_goal) {
        for (
          let i = 0;
          i < profile.user.general_profile.profile_goal.length;
          i++
        ) {
          const goal = await firstValueFrom(
            this.adminClient.send(
              'get_goal_by_id',
              profile.user.general_profile.profile_goal[i].goal_id,
            ),
          );
          if (goal) {
            profile.user.general_profile.profile_goal[i] = goal;
          } else {
            profile.user.general_profile.profile_goal[i] = {
              status: 500,
              message: 'No goal found',
            };
          }
        }
      }
      return profile;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserProfileReview(
    id: number,
    data: ExpertReviewFilterDto,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const newD = {
        take: data.limit,
        skip,
      };
      let total = [];
      let review;
      let order = '';
      if (data.sort_by == EXPERT_REVIEW_SORT_BY.MOST_RECENT) {
        order = 'ORDER BY id DESC';
      }
      if (data.search) {
        total = await this.expertRepo.query(
          `SELECT * FROM user_expertise_review WHERE expertise_user_id = ${id} AND (LOWER(comment) LIKE LOWER('%${data.search}%') OR LOWER(title) LIKE LOWER('%${data.search}%'));`,
        );
        review = await this.expertRepo.query(
          `SELECT * FROM user_expertise_review WHERE expertise_user_id = ${id} AND (LOWER(comment) LIKE LOWER('%${data.search}%') OR LOWER(title) LIKE LOWER('%${data.search}%')) ${order} LIMIT ${newD.take} OFFSET ${newD.skip};`,
        );
      } else {
        total = await this.expertRepo.query(
          `SELECT * FROM user_expertise_review WHERE expertise_user_id = ${id};`,
        );
        review = await this.expertRepo.query(
          `SELECT * FROM user_expertise_review WHERE expertise_user_id = ${id} ${order} LIMIT ${newD.take} OFFSET ${newD.skip};`,
        );
      }
      const totalPages = Math.ceil(total.length / data.limit);
      if (data.sort_by == EXPERT_REVIEW_SORT_BY.MOST_RELEVANT) {
      }
      const review_count = await this.expertRepo.query(
        `SELECT COUNT(*) AS count FROM user_expertise_review WHERE expertise_user_id = ${id}`,
      );
      const reviewer = await this.expertRepo
        .query(`SELECT created_by , COUNT(created_by) as total
        FROM user_expertise_review
        WHERE expertise_user_id = ${id}
        GROUP BY created_by
        ORDER BY total DESC
        `);

      const individual = await this.expertRepo
        .query(`SELECT over_all_rating , COUNT(over_all_rating) as total
      FROM user_expertise_review
      WHERE expertise_user_id = ${id}
      GROUP BY over_all_rating
      ORDER BY total DESC
      `);
      const reviewCount = review_count;
      const reviews: any = [...review];
      let allRating = 0;
      for (let i = 0; i < reviews.length; i++) {
        const user = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(reviews[i].created_by),
          }),
        );
        delete user.password;
        delete user.verification_code;
        delete user.reset_password_otp;
        reviews[i].created_by = user;
        const current_user_reaction_status = await this.expertRepo.query(
          `SELECT * FROM user_expertise_review_reaction WHERE user_expertise_review_id = ${reviews[i].id} AND created_by = ${id} ORDER BY id DESC LIMIT 1`,
        );
        reviews[i].current_user_reaction_status =
          current_user_reaction_status.length
            ? current_user_reaction_status[0]
            : {};
        allRating = allRating + parseInt(reviews[i].over_all_rating);
      }
      const reviewCounts = parseInt(reviewCount[0].count);

      return {
        individual: individual,
        data: reviews,
        review_count: allRating / reviewCounts,
        reviewer_count: reviewer.length,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total.length,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllExpert(data: any): Promise<any> {
    try {
      const experts = await this.expertRepo.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
      });
      return experts;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async createExpertPortfolio(
    user_id: number,
    data: CreateUserPortFolioDTO,
  ): Promise<any> {
    try {
      const user = await this.appService.getUserProfileById(user_id);
      if (!user.expert_profile) {
        return {
          status: 500,
          message: 'No expert profile found.',
        };
      }
      const userPortfolio = new UserPortfolio();
      userPortfolio.attachments = data.attachments;
      userPortfolio.website_link = data.website_link;
      userPortfolio.content_type = data.content_type;
      userPortfolio.description = data.description;
      userPortfolio.title = data.title;
      userPortfolio.portfolio_type = data.portfolio_type;
      userPortfolio.user = user;
      userPortfolio.skills = data.skills;
      await this.userPortfolioRepository.save(userPortfolio);
      return userPortfolio;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateExpertPortfolio(
    id: number,
    user_id: number,
    data: UpdateUserPortFolioDTO,
  ): Promise<any> {
    try {
      const userPortfolio = await this.userPortfolioRepository.findOne({
        where: {
          id: id,
          user: {
            id: user_id,
          },
        },
      });
      if (!userPortfolio) {
        return {
          status: 500,
          message: 'No user portfolio found.',
        };
      }
      await this.userPortfolioRepository.update({ id: id }, data);
      return {
        status: 200,
        message: 'User portfolio updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllExpertPortfolio(id: number): Promise<any> {
    try {
      const where: any =
        id > 0
          ? {
              user: {
                id: id,
              },
            }
          : {};
      const userPortfolio = await this.userPortfolioRepository.find({
        where: where,
      });
      if (!userPortfolio.length) {
        return {
          status: 500,
          message: 'No user portfolio found.',
        };
      }
      return userPortfolio;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getExpertPortfolioById(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const userPortfolio = await this.userPortfolioRepository.findOne({
        where: {
          id: id,
          user: {
            id: user_id,
          },
        },
      });

      if (!userPortfolio) {
        return {
          status: 500,
          message: 'No user portfolio found.',
        };
      }
      return userPortfolio;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteExpertPortfolio(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const userPortfolio = await this.userPortfolioRepository.findOne({
        where: {
          id: id,
          user: {
            id: user_id,
          },
        },
      });
      if (!userPortfolio) {
        return {
          status: 500,
          message: 'No user portfolio found.',
        };
      }
      await this.userPortfolioRepository.delete(id);
      return {
        status: 200,
        message: 'User portfolio deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createExpertProfileReaction(
    data: CreateExpertProfileReactionDto,
    user_id: number,
  ) {
    try {
      const expertise_basic = await this.expertRepo.findOne({
        where: { id: data.expert_id },
        relations: ['user'],
      });
      if (!expertise_basic) {
        return {
          status: 500,
          message: 'No expert found.',
        };
      }
      const expertiseReaction = new ExpertProfileReaction();
      expertiseReaction.user = expertise_basic.user;
      expertiseReaction.reaction = data.reaction;
      expertiseReaction.created_by = user_id;
      await this.expertProfileReactionRepository.save(expertiseReaction);
      return expertiseReaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateExpertProfileReaction(data: any, id: number) {
    try {
      const expertiseReaction =
        await this.expertProfileReactionRepository.findOne({
          where: { id: id },
        });
      if (!expertiseReaction) {
        return {
          status: 500,
          message: 'No expert reaction found.',
        };
      }
      if (data.expert_id) {
        const expertise_basic = await this.expertRepo.findOne({
          where: { id: data.expert_id },
          relations: ['user'],
        });
        if (!expertise_basic) {
          return {
            status: 500,
            message: 'No expert found.',
          };
        }
        delete data.expert_id;
        data.user = expertise_basic.user;
      }
      await this.expertProfileReactionRepository.update(id, data);
      return {
        status: 200,
        message: 'Expertise reaction updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteExpertProfileReactionById(id: number) {
    try {
      const expertiseReaction =
        await this.expertProfileReactionRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!expertiseReaction) {
        return {
          status: 500,
          message: 'No expert reaction found.',
        };
      }
      await this.expertProfileReactionRepository.delete(id);
      return {
        status: 200,
        message: 'Expertise reaction deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getExpertProfileReactionById(id: number) {
    try {
      const expertiseReaction =
        await this.expertProfileReactionRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!expertiseReaction) {
        return {
          status: 500,
          message: 'No expert reaction found.',
        };
      }
      return expertiseReaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
