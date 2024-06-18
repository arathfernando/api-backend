/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  FILE_UPLOAD_BY,
  JOB_FILTER,
  JOB_SORT,
  PROPOSAL_FILTER,
  PROPOSAL_JOB_STATUS,
  PROPOSAL_PAYMENT_TYPE,
} from 'src/core/constant/enum.constant';
import { JobFilterDTO } from 'src/core/dtos/jobs/job-basic-filter.dto';
import { CreateJobBasicDTO } from 'src/core/dtos/jobs/job-basic.dto';
import { CreateJobProposalDTO } from 'src/core/dtos/jobs/job-proposal.dto';
import { CreateJobReactionDto } from 'src/core/dtos/jobs/job-reaction.dto';
import {
  JobFiles,
  JobProposalBillingSettings,
  JobProposalPayment,
  JobProposalReply,
  JobReaction,
  ProjectBasic,
  UserExpertiseProposalReply,
  UserExpertiseReviewReaction,
} from 'src/database/entities';
import { UserExpertiseReview } from 'src/database/entities/user-expertise-review.entity';
import { JobBasic, JobProposal } from 'src/database/entities';
import { ILike, In, Repository } from 'typeorm';
import { CreateUserExpertiseProposalDTO } from 'src/core/dtos/jobs/user-experties-proposal.dto';
import { UserExpertiseProposal } from 'src/database/entities/user-expertise-proposal.entity';
import { CreateJobProposalReplyDTO } from 'src/core/dtos/jobs/job-proposal-reply.dto';
import { CreateUserExpertiseProposalReplyDTO } from 'src/core/dtos/jobs/user-expertise-proposal-reply.dto';
import { JobALLFilterDTO } from 'src/core/dtos/jobs/job-all-filter.dto';
import { CreateUserExpertiseReviewReactionDto } from 'src/core/dtos/jobs/user-expertise-review-reaction.dto';
import { CreateJobFilesDTO } from 'src/core/dtos/jobs/job-files.dto';
import { CreateJobProposalPaymentDTO } from 'src/core/dtos/jobs/job-proposal-payment.dto';
import { CreateUserExpertiseReviewReplyDTO } from 'src/core/dtos/jobs/user-expertise-review-reply.dto';
import { UserExpertiseReviewReply } from 'src/database/entities/user-expertise-review-reply.entity';
import { PROPOSAL_STATUS } from 'src/core/constant/enum.constant';
import { CreateJobProposalBillingSettingDTO } from 'src/core/dtos/jobs/job-proposal-billing-settings.dto';
import { createUserExpertiseReportDto } from 'src/core/dtos/jobs/user-expertise-report.dto';
import { UserExpertiseReport } from 'src/database/entities/user-expertise-report.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JobService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('TRANSACTION_SERVICE')
    private readonly transactionClient: ClientProxy,
    @InjectRepository(JobBasic)
    private readonly jobBasicRepository: Repository<JobBasic>,
    @InjectRepository(JobProposal)
    private readonly jobProposalRepository: Repository<JobProposal>,
    @InjectRepository(JobReaction)
    private readonly jobReactionRepository: Repository<JobReaction>,
    @InjectRepository(UserExpertiseReview)
    private readonly userExpertiseReviewRepository: Repository<UserExpertiseReview>,
    @InjectRepository(UserExpertiseProposal)
    private readonly userExpertiseProposalRepository: Repository<UserExpertiseProposal>,
    @InjectRepository(UserExpertiseProposalReply)
    private readonly userExpertiseProposalReplyRepository: Repository<UserExpertiseProposalReply>,
    @InjectRepository(JobProposalReply)
    private readonly jobProposalReplyRepository: Repository<JobProposalReply>,
    @InjectRepository(JobFiles)
    private readonly jobFilesRepository: Repository<JobFiles>,
    @InjectRepository(ProjectBasic)
    private readonly projectBasicRepository: Repository<ProjectBasic>,
    @InjectRepository(UserExpertiseReviewReaction)
    private readonly userExpertiseReviewReactionRepository: Repository<UserExpertiseReviewReaction>,
    @InjectRepository(JobProposalPayment)
    private readonly jobProposalPaymentRepository: Repository<JobProposalPayment>,
    @InjectRepository(UserExpertiseReviewReply)
    private readonly userExpertiseReviewReplyRepository: Repository<UserExpertiseReviewReply>,
    @InjectRepository(JobProposalBillingSettings)
    private readonly jobProposalBillingSettingsRepository: Repository<JobProposalBillingSettings>,
    @InjectRepository(UserExpertiseReport)
    private readonly userExpertiseReportRepository: Repository<UserExpertiseReport>,
  ) {}

  public async getUser(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_id', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }
  public async currentUserJobReactionStatus(user_id: number, job_id: number) {
    const current_user_job_reaction = await this.jobReactionRepository.findOne({
      where: {
        created_by: user_id,
        job_basic: {
          id: job_id,
        },
      },
      order: {
        id: 'DESC',
      },
    });
    return current_user_job_reaction || {};
  }

  public async jobProposalCount(job_id: number) {
    return await this.jobProposalRepository.count({
      where: {
        job_basic: {
          id: job_id,
        },
      },
    });
  }

  public async jobProposalTotalPrice(job_id: number) {
    return await this.jobProposalRepository
      .createQueryBuilder('proposal')
      .select('SUM(proposal.rate)', 'sum')
      .getRawOne();
  }

  public async getJobSkillById(ids: number[]): Promise<any> {
    const jobSkill = await firstValueFrom(
      this.adminClient.send<any>('get_skill_by_ids', JSON.stringify(ids)),
    );

    return jobSkill;
  }

  public async createJob(data: CreateJobBasicDTO, user_id: number) {
    try {
      const jobBasic = new JobBasic();
      if (data.project_id) {
        const project = await this.projectBasicRepository.findOne({
          where: {
            id: data.project_id,
          },
        });
        if (!project) {
          return {
            status: 500,
            message: 'No project found.',
          };
        }
        jobBasic.project = project;
      }
      jobBasic.attachments = data.attachments;
      jobBasic.end_date = data.end_date;
      jobBasic.job_description = data.job_description;
      jobBasic.job_name = data.job_name;
      jobBasic.status = data.status;
      jobBasic.price = data.price;
      jobBasic.skills = data.skills;
      jobBasic.created_by = user_id;
      await this.jobBasicRepository.save(jobBasic);
      return jobBasic;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJob(data: any, id: number) {
    try {
      const job = await this.jobBasicRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!job) {
        return {
          status: 500,
          message: 'No job found.',
        };
      }

      if (data.project_id) {
        const project = await this.projectBasicRepository.findOne({
          where: {
            id: data.project_id,
          },
        });

        if (!project) {
          return {
            status: 500,
            message: 'No project found.',
          };
        }
        data.project = project;
        delete data.project_id;
      }
      await this.jobBasicRepository.update(id, data);
      return {
        status: 200,
        message: 'Job updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobById(id: number, user_id: number) {
    try {
      const job: any = await this.jobBasicRepository.findOne({
        where: { id: id },
        relations: ['job_files'],
      });
      if (!job) {
        return {
          status: 500,
          message: 'No job found.',
        };
      }
      if (job.skills) {
        job.skills = await this.getJobSkillById(job.skills);
      }
      job.current_user_job_reaction = await this.currentUserJobReactionStatus(
        job.created_by,
        job.id,
      );
      job.job_proposal_count = await this.jobProposalCount(job.id);
      job.created_by = await this.getUser(job.created_by);
      job.current_user_proposal_status =
        await this.jobProposalRepository.findOne({
          where: {
            created_by: user_id,
            job_basic: {
              id: job.id,
            },
          },
        });
      return job;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobByProjectId(id: number, user_id: number) {
    try {
      const jobs: any = await this.jobBasicRepository.find({
        where: {
          project: {
            id: id,
          },
          created_by: user_id,
        },
      });
      if (!jobs) {
        return {
          status: 500,
          message: 'No job found.',
        };
      }
      for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].skills) {
          jobs[i].skills = await this.getJobSkillById(jobs[i].skills);
        }
        jobs[i].current_user_job_reaction =
          await this.currentUserJobReactionStatus(
            jobs[i].created_by,
            jobs[i].id,
          );
        jobs[i].job_proposal_count = await this.jobProposalCount(jobs[i].id);
        const totalPrice = await this.jobProposalTotalPrice(jobs[i].id);
        jobs[i].job_average_proposal_price =
          totalPrice.sum / jobs[i].job_proposal_count;
        jobs[i].created_by = await this.getUser(jobs[i].created_by);
      }
      return jobs;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobById(id: number, user_id: number) {
    try {
      const where = user_id == 0 ? { id: id } : { id: id, created_by: user_id };
      const job = await this.jobBasicRepository.findOne({
        where: where,
      });
      if (!job) {
        return {
          status: 500,
          message: 'No job found.',
        };
      }
      await this.jobBasicRepository.delete(id);
      return {
        status: 200,
        message: 'Job deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllUserJobs(data: JobFilterDTO, user_id: number) {
    try {
      const skip = data.limit * data.page - data.limit;
      const newD = {
        take: data.limit,
        skip,
      };
      const whereConn: any = {
        where: {},
        order: {
          id: 'DESC',
        },
        relations: ['job_proposal'],
        take: newD.take,
        skip: newD.skip,
      };
      if (user_id) {
        whereConn.where.created_by = user_id;
      }
      if (data.search) {
        whereConn.where.job_name = ILike(`%${data.search}%`);
      }
      if (data.status) {
        whereConn.where.status = data.status;
      }
      const jobs: any = await this.jobBasicRepository.find(whereConn);
      if (!jobs.length) {
        return {
          status: 500,
          message: 'No jobs found.',
        };
      }
      for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].skills) {
          jobs[i].skills = await this.getJobSkillById(jobs[i].skills);
        }
        jobs[i].current_user_job_reaction =
          await this.currentUserJobReactionStatus(
            jobs[i].created_by,
            jobs[i].id,
          );
        jobs[i].job_proposal_count = await this.jobProposalCount(jobs[i].id);
        const totalPrice = await this.jobProposalTotalPrice(jobs[i].id);
        jobs[i].job_average_proposal_price =
          totalPrice.sum / jobs[i].job_proposal_count;
        jobs[i].created_by = await this.getUser(jobs[i].created_by);
        jobs[i].review_count = 0;
        jobs[i].reviewer_count = 0;
        if (jobs[i].job_proposal.length) {
          const proposal_ids = await this.arrayColumn(
            jobs[i].job_proposal,
            'id',
          );
          const user_expertise_review =
            await this.userExpertiseReviewRepository.find({
              where: {
                job_proposal: In(proposal_ids),
              },
            });
          if (user_expertise_review.length) {
            const user_expertise_review_ids = await this.arrayColumn(
              user_expertise_review,
              'id',
            );
            const reviewer = await this.userExpertiseReviewReplyRepository
              .query(`SELECT created_by , COUNT(created_by) as total
                FROM user_expertise_review_reply
            WHERE user_expertise_review_id In (${user_expertise_review_ids.join(
              ',',
            )})
              GROUP BY created_by
            ORDER BY total DESC
            `);
            const review_count =
              await this.userExpertiseReviewReplyRepository.count({
                where: {
                  user_expertise_review: {
                    id: In(user_expertise_review_ids),
                  },
                },
              });
            jobs[i].review_count = review_count;
            jobs[i].reviewer_count = reviewer.length;
          }
        }
      }
      const total = await this.jobBasicRepository.count({
        where: whereConn.where,
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: jobs,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async getAllJobs(data: JobALLFilterDTO, user_id: number) {
    try {
      const skip = data.limit * data.page - data.limit;
      const newD = {
        take: data.limit,
        skip,
      };
      const whereConn: any = {
        where: {},
        relations: ['job_proposal'],
        order: {
          id: 'DESC',
        },
        take: newD.take,
        skip: newD.skip,
      };
      if (data.job_filter == JOB_FILTER.RECENTLY_ADDED) {
      }
      if (data.job_filter == JOB_FILTER.ALL) {
      }
      if (data.job_filter == JOB_FILTER.JUST_ADDED) {
      }
      if (data.job_filter == JOB_FILTER.MOST_POPULAR) {
      }
      if (data.job_filter == JOB_FILTER.SAVED_JOBS) {
      }
      if (data.job_filter == JOB_FILTER.MY_JOBS) {
        whereConn.where.created_by = user_id;
      }
      if (data.job_filter == JOB_FILTER.TRENDING) {
      }
      if (data.job_filter == JOB_FILTER.RELATED_JOBS) {
      }
      if (data.sort == JOB_SORT.DATE) {
      }
      if (data.search) {
        const jobData = await this.jobBasicRepository.find({
          where: [
            { job_name: ILike(`%${data.search}%`) },
            { job_description: ILike(`%${data.search}%`) },
          ],
        });
        const jobIds = await this.arrayColumn(jobData, 'id');
        whereConn.where = {
          id: In(jobIds),
        };
      }
      if (data.skill) {
        const jobs = await this.jobBasicRepository
          .createQueryBuilder('job_basic')
          .andWhere(':skill = ANY(job_basic.skills)', {
            skill: `${data.skill}`,
          })
          .getMany();
        const jobIds = await this.arrayColumn(jobs, 'id');
        whereConn.where.id = In(jobIds);
      }
      const jobs: any = await this.jobBasicRepository.find(whereConn);
      if (!jobs.length) {
        return {
          status: 500,
          message: 'No job found.',
        };
      }
      for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].skills) {
          jobs[i].skills = await this.getJobSkillById(jobs[i].skills);
        }
        jobs[i].current_user_job_reaction =
          await this.currentUserJobReactionStatus(
            jobs[i].created_by,
            jobs[i].id,
          );

        jobs[i].proposal_count = await this.jobProposalRepository.count({
          where: {
            job_basic: {
              id: jobs[i].id,
            },
          },
        });
        jobs[i].created_by = await this.getUser(jobs[i].created_by);
        jobs[i].review_count = 0;
        jobs[i].reviewer_count = 0;
        if (jobs[i].job_proposal.length) {
          const proposal_ids = await this.arrayColumn(
            jobs[i].job_proposal,
            'id',
          );
          const user_expertise_review =
            await this.userExpertiseReviewRepository.find({
              where: {
                job_proposal: In(proposal_ids),
              },
            });
          if (user_expertise_review.length) {
            const user_expertise_review_ids = await this.arrayColumn(
              user_expertise_review,
              'id',
            );
            const reviewer = await this.userExpertiseReviewReplyRepository
              .query(`SELECT created_by , COUNT(created_by) as total
                FROM user_expertise_review_reply
            WHERE user_expertise_review_id In (${user_expertise_review_ids.join(
              ',',
            )})
              GROUP BY created_by
            ORDER BY total DESC
            `);
            const review_count =
              await this.userExpertiseReviewReplyRepository.count({
                where: {
                  user_expertise_review: {
                    id: In(user_expertise_review_ids),
                  },
                },
              });
            jobs[i].review_count = review_count;
            jobs[i].reviewer_count = reviewer.length;
          }
        }
      }
      const total = await this.jobBasicRepository.count({
        where: whereConn.where,
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: jobs,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createJobProposal(data: CreateJobProposalDTO, user_id: number) {
    try {
      const job_basic = await this.jobBasicRepository.findOne({
        where: {
          id: data.job_id,
        },
      });
      if (!job_basic) {
        return {
          status: 500,
          message: 'No job found.',
        };
      }
      const jobProposal = new JobProposal();
      jobProposal.attachments = data.attachments;
      jobProposal.delivery_date = data.delivery_date;
      jobProposal.bid_description = data.bid_description;
      jobProposal.job_basic = job_basic;
      jobProposal.proposal_job_status = data.proposal_job_status;
      jobProposal.status = data.status;
      jobProposal.rate = data.rate;
      jobProposal.rate_type = data.rate_type;
      jobProposal.skills = data.skills;
      jobProposal.created_by = user_id;
      await this.jobProposalRepository.save(jobProposal);
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobProposal(data: any, id: number) {
    try {
      const jobProposal = await this.jobProposalRepository.findOne({
        where: {
          id: id,
        },
        relations: ['job_basic'],
      });
      if (!jobProposal) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }
      if (data.job_id) {
        const job_basic = await this.jobBasicRepository.findOne({
          where: {
            id: data.job_id,
          },
        });
        if (!job_basic) {
          return {
            status: 500,
            message: 'No job found.',
          };
        }
        delete data.job_id;
        data.job_basic = job_basic;
      }
      await this.jobProposalRepository.update(id, data);
      return {
        status: 200,
        message: 'Job proposal updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobProposalById(id: number) {
    try {
      const jobProposal = await this.jobProposalRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobProposal) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }
      await this.jobProposalRepository.delete(id);
      return {
        status: 200,
        message: 'Job proposal deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalById(id: number) {
    try {
      const jobProposal = await this.jobProposalRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobProposal) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserJobProposal(
    proposal_job_status: PROPOSAL_JOB_STATUS,
    search: string,
    user_id: number,
  ) {
    try {
      const whereConn: any = {
        where: {
          created_by: user_id,
          proposal_job_status: proposal_job_status,
        },
        relations: ['job_basic'],
      };
      if (search) {
        const jobData = await this.jobBasicRepository.find({
          where: {
            job_name: ILike(`%${search}%`),
          },
        });
        const jobIds = await this.arrayColumn(jobData, 'id');
        const jobProposal = await this.jobProposalRepository.find({
          where: [
            {
              bid_description: ILike(`%${search}%`),
            },
            {
              job_basic: {
                id: In(jobIds),
              },
            },
          ],
        });
        const proposalIds = await this.arrayColumn(jobProposal, 'id');

        whereConn.where.id = In(proposalIds);
      }
      const jobProposal = await this.jobProposalRepository.find(whereConn);
      if (!jobProposal) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }
      for (let i = 0; i < jobProposal.length; i++) {
        if (jobProposal[i].job_basic) {
          jobProposal[i].job_basic.created_by = await this.getUser(
            jobProposal[i].job_basic.created_by,
          );
        }
      }
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalByJobId(
    id: number,
    filter: string,
    search: string,
    proposal_status: PROPOSAL_STATUS,
  ) {
    try {
      const whereConn: any = {
        where: {
          job_basic: {
            id: id,
          },
        },
        relations: ['job_proposal_billing_setting', 'job_proposal_payment'],
      };
      if (proposal_status) {
        whereConn.where.status = proposal_status;
      }
      if (filter == PROPOSAL_FILTER.LATEST) {
        whereConn.order = {
          id: 'DESC',
        };
      }

      if (filter == PROPOSAL_FILTER.OLDEST) {
        whereConn.order = {
          id: 'ASC',
        };
      }

      if (filter == PROPOSAL_FILTER.HIGHEST) {
        whereConn.order = {
          rate: 'DESC',
        };
      }

      if (filter == PROPOSAL_FILTER.LOWEST) {
        whereConn.order = {
          rate: 'ASC',
        };
      }
      if (search) {
        whereConn.job_description = ILike(`%${search}%`);
      }
      const jobProposal: any = await this.jobProposalRepository.find(whereConn);
      if (!jobProposal.length) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }

      for (let i = 0; i < jobProposal.length; i++) {
        const user = await this.getUser(Number(jobProposal[i].created_by));
        jobProposal[i].created_by = user;

        const reviewCount = await this.userExpertiseReviewRepository.count({
          where: {
            job_proposal: jobProposal[i],
          },
        });
        jobProposal[i].review_count = reviewCount;

        const reviewer = await this.userExpertiseReviewRepository
          .query(`SELECT created_by , COUNT(created_by) as total
      FROM user_expertise_review
      WHERE job_proposal_id = ${jobProposal[i].id}
      GROUP BY created_by
      ORDER BY total DESC
      `);
        jobProposal[i].reviewer_count = reviewer.length;
        if (jobProposal[i].skills) {
          jobProposal[i].skills = await this.getJobSkillById(
            jobProposal[i].skills,
          );
        }
      }
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createJobReaction(data: CreateJobReactionDto, user_id: number) {
    try {
      const job_basic = await this.jobBasicRepository.findOne({
        where: {
          id: data.job_id,
        },
      });
      if (!job_basic) {
        return {
          status: 500,
          message: 'No job found.',
        };
      }
      const jobReaction = new JobReaction();
      jobReaction.job_basic = job_basic;
      jobReaction.reaction = data.reaction;
      jobReaction.created_by = user_id;
      await this.jobReactionRepository.save(jobReaction);
      return jobReaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobReaction(data: any, id: number) {
    try {
      const jobReaction = await this.jobReactionRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobReaction) {
        return {
          status: 500,
          message: 'No job reaction found.',
        };
      }
      if (data.job_id) {
        const job_basic = await this.jobBasicRepository.findOne({
          where: {
            id: data.job_id,
          },
        });
        if (!job_basic) {
          return {
            status: 500,
            message: 'No job found.',
          };
        }
        delete data.job_id;
        data.job_basic = job_basic;
      }
      await this.jobReactionRepository.update(id, data);
      return {
        status: 200,
        message: 'Job reaction updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobReactionById(id: number) {
    try {
      const jobReaction = await this.jobReactionRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobReaction) {
        return {
          status: 500,
          message: 'No job reaction found.',
        };
      }
      await this.jobReactionRepository.delete(id);
      return {
        status: 200,
        message: 'Job reaction deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobReactionById(id: number) {
    try {
      const jobReaction = await this.jobReactionRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobReaction) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }
      return jobReaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createJobProposalReview(data: any, user_id: number) {
    try {
      const jobProposalReview = new UserExpertiseReview();
      if (data.proposal_id) {
        const job_proposal = await this.jobProposalRepository.findOne({
          where: {
            id: data.proposal_id,
          },
        });
        if (!job_proposal) {
          return {
            status: 500,
            message: 'No job proposal found.',
          };
        }
        jobProposalReview.job_proposal = job_proposal;
      }
      jobProposalReview.created_by = user_id;
      jobProposalReview.expertise_user_id = data.expertise_user_id;
      jobProposalReview.over_all_rating = data.over_all_rating;
      jobProposalReview.expertise_content = data.expertise_content;
      jobProposalReview.delivery = data.delivery;
      jobProposalReview.results = data.results;
      jobProposalReview.title = data.title;
      jobProposalReview.comment = data.comment;
      await this.userExpertiseReviewRepository.save(jobProposalReview);
      return jobProposalReview;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobProposalReview(data: any, id: number) {
    try {
      const jobProposalReview =
        await this.userExpertiseReviewRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!jobProposalReview) {
        return {
          status: 500,
          message: 'No job proposal review found.',
        };
      }
      if (data.proposal_id) {
        const job_proposal = await this.jobProposalRepository.findOne({
          where: {
            id: data.proposal_id,
          },
        });
        if (!job_proposal) {
          return {
            status: 500,
            message: 'No job proposal found.',
          };
        }
        delete data.proposal_id;
        data.job_proposal = job_proposal;
      }
      await this.userExpertiseReviewRepository.update(id, data);
      return {
        status: 200,
        message: 'Job proposal review updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobProposalReviewById(id: number) {
    try {
      const jobProposalReview =
        await this.userExpertiseReviewRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!jobProposalReview) {
        return {
          status: 500,
          message: 'No job proposal review found.',
        };
      }
      await this.userExpertiseReviewRepository.delete(id);
      return {
        status: 200,
        message: 'Job proposal review deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalReviewById(id: number) {
    try {
      const jobProposalReview =
        await this.userExpertiseReviewRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!jobProposalReview) {
        return {
          status: 500,
          message: 'No job proposal review found.',
        };
      }
      return jobProposalReview;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllJobProposalReview(data: any): Promise<any> {
    try {
      const review = await this.userExpertiseReviewRepository.find({
        order: {
          id: 'DESC',
        },
        relations: ['job_proposal', 'job_proposal.job_basic'],
        take: data.take,
        skip: data.skip,
      });
      if (!review.length) {
        return {
          status: 500,
          message: 'No Review found.',
        };
      }
      for (let i = 0; i < review.length; i++) {
        review[i].created_by = await this.getUser(review[i].created_by);
        review[i].expertise_user_id = await this.getUser(
          review[i].expertise_user_id,
        );
      }
      return review;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalReviewByProposalId(id: number, user_id: number) {
    try {
      const jobProposalReview: any =
        await this.userExpertiseReviewRepository.find({
          where: {
            job_proposal: {
              id: id,
            },
          },
        });
      if (!jobProposalReview.length) {
        return {
          status: 500,
          message: 'No job proposal review found.',
        };
      }
      for (let i = 0; i < jobProposalReview.length; i++) {
        const currentUserStatus =
          await this.userExpertiseReviewReplyRepository.find({
            where: {
              created_by: user_id,
              user_expertise_review: jobProposalReview[i].id,
            },
          });
        jobProposalReview[i].current_user_status = currentUserStatus
          ? currentUserStatus
          : {};
      }
      return jobProposalReview;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalReviewByJobId(id: number, user_id: number) {
    try {
      //GET JOB FREE LANCERS
      const freelancer: any = await this.jobProposalRepository.find({
        where: {
          job_basic: {
            id: id,
          },
          status: PROPOSAL_STATUS.ACCEPTED,
          proposal_job_status: PROPOSAL_JOB_STATUS.COMPLETED,
        },
      });
      if (!freelancer.length) {
        return {
          status: 500,
          message:
            'No job proposal accepted or no proposal job status is completed.',
        };
      }
      for (let i = 0; i < freelancer.length; i++) {
        freelancer[i].user_expertise_review =
          await this.userExpertiseReviewRepository.find({
            where: {
              job_proposal: { id: freelancer[i].id },
              created_by: user_id,
            },
          });
        const user = await this.getUser(Number(freelancer[i].created_by));
        freelancer[i].created_by = user;
        const sumReview = await this.userExpertiseReviewRepository
          .createQueryBuilder('review')
          .select('SUM(review.over_all_rating)', 'sum')
          .where('job_proposal_id = :job_proposal_id', {
            job_proposal_id: freelancer[i].id,
          })
          .andWhere('created_by = :user_id', { user_id: user_id })
          .getRawOne();
        freelancer[i].review_count = freelancer[i].user_expertise_review.length;
        freelancer[i].over_all_rating =
          sumReview.sum / freelancer[i].user_expertise_review.length;
      }
      return freelancer;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createUserExpertiseProposal(
    data: CreateUserExpertiseProposalDTO,
    user_id: number,
  ) {
    try {
      const userExpertiseProposal = new UserExpertiseProposal();
      userExpertiseProposal.attachments = data.attachments;
      userExpertiseProposal.project_name = data.project_name;
      userExpertiseProposal.bid_description = data.bid_description;
      userExpertiseProposal.status = data.status;
      userExpertiseProposal.rate = data.rate;
      userExpertiseProposal.rate_type = data.rate_type;
      userExpertiseProposal.created_by = user_id;
      userExpertiseProposal.user_id = data.user_id;
      await this.userExpertiseProposalRepository.save(userExpertiseProposal);
      return userExpertiseProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserExpertiseProposal(data: any, id: number) {
    try {
      const userExpertiseProposal =
        await this.userExpertiseProposalRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!userExpertiseProposal) {
        return {
          status: 500,
          message: 'No user proposal found.',
        };
      }
      await this.userExpertiseProposalRepository.update(id, data);
      return {
        status: 200,
        message: 'User proposal updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteUserExpertiseProposalById(id: number) {
    try {
      const userExpertiseProposal =
        await this.userExpertiseProposalRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!userExpertiseProposal) {
        return {
          status: 500,
          message: 'No user proposal found.',
        };
      }
      await this.userExpertiseProposalRepository.delete(id);
      return {
        status: 200,
        message: 'User proposal deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserExpertiseProposalById(id: number) {
    try {
      const userExpertiseProposal =
        await this.userExpertiseProposalRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!userExpertiseProposal) {
        return {
          status: 500,
          message: 'No user proposal found.',
        };
      }
      return userExpertiseProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserExpertiseProposalByUserId(search: string, id: number) {
    try {
      const whereConn: any = {
        where: {
          user_id: id,
        },
      };
      if (search) {
        whereConn.job_description = ILike(`%${search}%`);
        whereConn.job_description = ILike(`%${search}%`);
      }
      const userExpertiseProposal: any =
        await this.userExpertiseProposalRepository.find(whereConn);
      if (!userExpertiseProposal.length) {
        return {
          status: 500,
          message: 'No user proposal found.',
        };
      }

      for (let i = 0; i < userExpertiseProposal.length; i++) {
        const created_by = await this.getUser(
          Number(userExpertiseProposal[i].created_by),
        );
        userExpertiseProposal[i].created_by = created_by;

        const user = await this.getUser(
          Number(userExpertiseProposal[i].user_id),
        );
        userExpertiseProposal[i].user_id = user;
      }
      return userExpertiseProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createUserExpertiseProposalReply(
    data: CreateUserExpertiseProposalReplyDTO,
    user_id: number,
  ) {
    try {
      const user_proposal = await this.userExpertiseProposalRepository.findOne({
        where: {
          user_id: data.user_id,
        },
      });
      if (!user_proposal) {
        return {
          status: 500,
          message: 'No user proposal found.',
        };
      }
      const userExpertiseProposal = new UserExpertiseProposalReply();
      userExpertiseProposal.created_by = user_id;
      userExpertiseProposal.user_expertise_proposal = user_proposal;
      userExpertiseProposal.message = data.message;
      await this.userExpertiseProposalReplyRepository.save(
        userExpertiseProposal,
      );
      return userExpertiseProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserExpertiseProposalReply(data: any, id: number) {
    try {
      const userExpertiseProposal =
        await this.userExpertiseProposalReplyRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!userExpertiseProposal) {
        return {
          status: 500,
          message: 'No user proposal reply found.',
        };
      }
      if (data.user_id) {
        const user_proposal =
          await this.userExpertiseProposalRepository.findOne({
            where: { id: data.user_id },
          });
        if (!user_proposal) {
          return {
            status: 500,
            message: 'No user proposal found.',
          };
        }
        delete data.user_id;
        data.user_expertise_proposal = user_proposal;
      }
      await this.userExpertiseProposalReplyRepository.update(id, data);
      return {
        status: 200,
        message: 'User proposal reply updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteUserExpertiseProposalReplyById(id: number) {
    try {
      const userExpertiseProposal =
        await this.userExpertiseProposalReplyRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!userExpertiseProposal) {
        return {
          status: 500,
          message: 'No user proposal reply found.',
        };
      }
      await this.userExpertiseProposalRepository.delete(id);
      return {
        status: 200,
        message: 'User proposal deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserExpertiseProposalReplyById(id: number) {
    try {
      const userExpertiseProposal =
        await this.userExpertiseProposalReplyRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!userExpertiseProposal) {
        return {
          status: 500,
          message: 'No user proposal reply found.',
        };
      }
      return userExpertiseProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserExpertiseProposalReplyByUserId(id: number) {
    try {
      const whereConn: any = {
        where: {
          created_by: id,
        },
      };
      const userExpertiseProposal: any =
        await this.userExpertiseProposalReplyRepository.find(whereConn);
      if (!userExpertiseProposal.length) {
        return {
          status: 500,
          message: 'No user proposal reply found.',
        };
      }

      for (let i = 0; i < userExpertiseProposal.length; i++) {
        const created_by = await this.getUser(
          Number(userExpertiseProposal[i].created_by),
        );
        userExpertiseProposal[i].created_by = created_by;

        const user = await this.getUser(
          Number(userExpertiseProposal[i].user_id),
        );
        userExpertiseProposal[i].user_id = user;
      }
      return userExpertiseProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserExpertiseProposalReplyByProposalId(id: number) {
    try {
      const userExpertiseProposal: any =
        await this.userExpertiseProposalReplyRepository.find({
          where: {
            user_expertise_proposal: {
              id: id,
            },
          },
        });
      if (!userExpertiseProposal.length) {
        return {
          status: 500,
          message: 'No user proposal reply found.',
        };
      }

      for (let i = 0; i < userExpertiseProposal.length; i++) {
        const created_by = await this.getUser(
          Number(userExpertiseProposal[i].created_by),
        );
        userExpertiseProposal[i].created_by = created_by;

        const user = await this.getUser(
          Number(userExpertiseProposal[i].user_id),
        );
        userExpertiseProposal[i].user_id = user;
      }
      return userExpertiseProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createJobProposalReply(
    data: CreateJobProposalReplyDTO,
    user_id: number,
  ) {
    try {
      const job_proposal = await this.jobProposalRepository.findOne({
        where: {
          id: data.job_proposal_id,
        },
      });
      if (!job_proposal) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }
      const jobProposal = new JobProposalReply();
      jobProposal.job_proposal = job_proposal;
      jobProposal.created_by = user_id;
      jobProposal.message = data.message;
      await this.jobProposalRepository.save(jobProposal);
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobProposalReply(data: any, id: number) {
    try {
      const jobProposalReply = await this.jobProposalReplyRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobProposalReply) {
        return {
          status: 500,
          message: 'No job proposal reply found.',
        };
      }
      if (data.job_proposal_id) {
        const job_proposal = await this.jobProposalRepository.findOne({
          where: {
            id: data.job_proposal_id,
          },
        });
        if (!job_proposal) {
          return {
            status: 500,
            message: 'No job proposal found.',
          };
        }
        delete data.job_proposal_id;
        data.job_proposal = job_proposal;
      }
      await this.jobProposalReplyRepository.update(id, data);
      return {
        status: 200,
        message: 'Job proposal reply updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobProposalReplyById(id: number) {
    try {
      const jobProposal = await this.jobProposalReplyRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobProposal) {
        return {
          status: 500,
          message: 'No job proposal reply found.',
        };
      }
      await this.jobProposalReplyRepository.delete(id);
      return {
        status: 200,
        message: 'Job proposal deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalReplyById(id: number) {
    try {
      const jobProposal = await this.jobProposalReplyRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobProposal) {
        return {
          status: 500,
          message: 'No job proposal reply found.',
        };
      }
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalByProposalId(id: number) {
    try {
      const whereConn: any = {
        where: {
          job_proposal: {
            id: id,
          },
        },
      };
      const jobProposal: any =
        await this.jobProposalReplyRepository.find(whereConn);
      if (!jobProposal.length) {
        return {
          status: 500,
          message: 'No job proposal reply found.',
        };
      }

      for (let i = 0; i < jobProposal.length; i++) {
        const user = await this.getUser(Number(jobProposal[i].created_by));
        jobProposal[i].created_by = user;
      }
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalReplyByUserId(id: number) {
    try {
      const jobProposal: any = await this.jobProposalReplyRepository.find({
        where: {
          created_by: id,
        },
      });
      if (!jobProposal.length) {
        return {
          status: 500,
          message: 'No job proposal reply found.',
        };
      }

      for (let i = 0; i < jobProposal.length; i++) {
        const user = await this.getUser(Number(jobProposal[i].created_by));
        jobProposal[i].created_by = user;
      }
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createUserExpertiseReview(
    data: CreateUserExpertiseReviewReactionDto,
    user_id: number,
  ) {
    try {
      const review = await this.userExpertiseReviewRepository.findOne({
        where: {
          id: data.user_expertise_review_id,
        },
      });
      if (!review) {
        return {
          status: 500,
          message: 'No user expertise review found.',
        };
      }
      const userExpertiseReviewReaction = new UserExpertiseReviewReaction();
      userExpertiseReviewReaction.user_expertise_review = review;
      userExpertiseReviewReaction.reaction = data.reaction;
      userExpertiseReviewReaction.created_by = user_id;
      await this.userExpertiseReviewReactionRepository.save(
        userExpertiseReviewReaction,
      );
      return userExpertiseReviewReaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserExpertiseReview(data: any, id: number) {
    try {
      const userExpertiseReviewReaction =
        await this.userExpertiseReviewReactionRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!userExpertiseReviewReaction) {
        return {
          status: 500,
          message: 'No user expertise review reaction found.',
        };
      }
      if (data.user_expertise_review_id) {
        const review = await this.userExpertiseReviewRepository.findOne({
          where: {
            id: data.user_expertise_review_id,
          },
        });
        if (!review) {
          return {
            status: 500,
            message: 'No user expertise review found.',
          };
        }
        delete data.user_expertise_review_id;
        data.user_expertise_review = review;
      }
      await this.userExpertiseReviewReactionRepository.update(id, data);
      return {
        status: 200,
        message: 'User expertise review reaction updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async createUserExpertiseReport(
    data: createUserExpertiseReportDto,
    user_id: number,
  ): Promise<any> {
    try {
      const userExpertiseReport = new UserExpertiseReport();
      userExpertiseReport.user_id = data.user_id;
      userExpertiseReport.report_type = data.report_type;
      userExpertiseReport.content_url = data.content_url;
      userExpertiseReport.description = data.description;
      userExpertiseReport.proof_of_your_copyright =
        data.proof_of_your_copyright;
      userExpertiseReport.created_by = user_id;
      await this.userExpertiseReportRepository.save(userExpertiseReport);
      return userExpertiseReport;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserExpertiseReport(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const userExpertiseReport =
        await this.userExpertiseReportRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!userExpertiseReport) {
        return {
          status: 500,
          message: 'No course report found.',
        };
      }
      await this.userExpertiseReportRepository.update(id, data);
      return {
        status: 200,
        message: 'Course report update successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserExpertiseReport(id: number): Promise<any> {
    try {
      const userExpertiseReport =
        await this.userExpertiseReportRepository.findOne({
          where: { id: id },
        });

      return userExpertiseReport;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteUserExpertiseReport(id: number): Promise<any> {
    try {
      const userExpertiseReport =
        await this.userExpertiseReportRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!userExpertiseReport) {
        return {
          status: 500,
          message: 'Course report not found.',
        };
      }
      await this.userExpertiseReportRepository.delete(id);
      return {
        status: 200,
        message: 'Course report deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async createJobFiles(data: CreateJobFilesDTO, user_id: number) {
    try {
      const job = await this.jobBasicRepository.findOne({
        where: {
          id: data.job_id,
        },
      });
      if (!job) {
        return {
          status: 500,
          message: 'No job found.',
        };
      }
      const job_files = new JobFiles();
      job_files.attachments = data.attachments;
      job_files.file_upload_by = data.file_upload_by;
      job_files.created_by = user_id;
      job_files.upload_to = data.upload_to;
      job_files.job = job;
      await this.jobFilesRepository.save(job_files);
      return job_files;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobFiles(data: any, id: number) {
    try {
      const jobFiles = await this.jobFilesRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!jobFiles) {
        return {
          status: 500,
          message: 'No job files found.',
        };
      }

      if (data.job_id) {
        const job = await this.jobBasicRepository.findOne({
          where: {
            id: data.job_id,
          },
        });

        if (!job) {
          return {
            status: 500,
            message: 'No job found.',
          };
        }
        data.job = job;
        delete data.job_id;
      }
      await this.jobFilesRepository.update(id, data);
      return {
        status: 200,
        message: 'Job files updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobFilesByJobId(id: number, upload_by: FILE_UPLOAD_BY) {
    try {
      const jobFiles: any = await this.jobFilesRepository.find({
        where: {
          job: {
            id: id,
          },
          file_upload_by: upload_by,
        },
      });
      if (!jobFiles || jobFiles.length === 0) {
        return {
          status: 500,
          message: 'No job files found.',
        };
      }
      for (let i = 0; i < jobFiles.length; i++) {
        jobFiles[i].created_by = await this.getUser(jobFiles[i].created_by);
      }
      return jobFiles;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteFilesById(id: number, user_id: number) {
    try {
      const files = await this.jobFilesRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });
      if (!files) {
        return {
          status: 500,
          message: 'No files found.',
        };
      }
      await this.jobFilesRepository.delete(id);
      return {
        status: 200,
        message: 'files deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createJobProposalPayment(
    data: CreateJobProposalPaymentDTO,
    user_id: number,
  ) {
    try {
      const job_proposal = await this.jobProposalRepository.findOne({
        where: {
          id: data.job_proposal_id,
        },
      });
      if (!job_proposal) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }
      const user = await this.getUser(user_id);
      if (!user.id) {
        return {
          status: 500,
          message: 'No user found.',
        };
      }
      if (data.payment_type == PROPOSAL_PAYMENT_TYPE.COMMUNITY_TOKEN) {
        if (
          user.general_profile.hbb_points != '' &&
          user.general_profile.hbb_points < data.amount
        ) {
          return {
            status: 500,
            message: 'Not enough HBB Token found for payment.',
          };
        } else {
          const updateData = {
            id: user.general_profile.id,
            hbb_points: user.general_profile.hbb_points - data.amount,
          };
          await firstValueFrom(
            this.userClient.send<any>(
              'update_general_profile',
              JSON.stringify(updateData),
            ),
          );
        }
      }
      const jobProposalPayment = new JobProposalPayment();
      jobProposalPayment.job_proposal = job_proposal;
      jobProposalPayment.created_by = user_id;
      jobProposalPayment.amount = data.amount;
      jobProposalPayment.payment_type = data.payment_type;
      await this.jobProposalPaymentRepository.save(jobProposalPayment);
      const createTransaction = {
        transaction_from_type:
          data.payment_type == PROPOSAL_PAYMENT_TYPE.COMMUNITY_TOKEN
            ? 'HBB'
            : 'CURRENCY',
        transaction_to_type:
          data.payment_type == PROPOSAL_PAYMENT_TYPE.COMMUNITY_TOKEN
            ? 'HBB'
            : 'CURRENCY',
        transaction_amount: data.amount,
        area: 0,
        transaction_from: user_id,
        transaction_to: data.job_proposal_id,
        operation_type: 'BUY',
        transaction_for_type: 'SERVICE',
        user_id: user_id,
      };
      await firstValueFrom(
        this.transactionClient.send<any>(
          'create_admin_transaction',
          JSON.stringify(createTransaction),
        ),
      );
      return jobProposalPayment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalPaymentByJobId(id: number) {
    try {
      const jobProposal: any = await this.jobProposalRepository.find({
        where: {
          job_basic: {
            id: id,
          },
        },
      });
      if (!jobProposal.length) {
        return {
          status: 500,
          message: 'No Job proposal found.',
        };
      }
      for (let i = 0; i < jobProposal.length; i++) {
        const jobProposalPayment = await this.jobProposalPaymentRepository.find(
          {
            where: {
              job_proposal: {
                id: jobProposal[i].id,
              },
            },
            relations: ['job_proposal.job_basic', 'job_proposal'],
          },
        );
        if (!jobProposalPayment.length) {
          return {
            status: 500,
            message: 'No Job payment found.',
          };
        }
        for (let i = 0; i < jobProposalPayment.length; i++) {
          jobProposalPayment[i].created_by = await this.getUser(
            jobProposalPayment[i].created_by,
          );
        }
        return jobProposalPayment;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalPaymentByJobAndUserId(
    id: number,
    user_id: number,
  ) {
    try {
      const jobProposal: any = await this.jobProposalRepository.find({
        where: {
          job_basic: {
            id: id,
          },
          created_by: user_id,
        },
      });
      if (!jobProposal.length) {
        return {
          status: 500,
          message: 'No Job proposal found.',
        };
      }
      const jobProposalIds = await this.arrayColumn(jobProposal, 'id');
      const jobProposalPayment = await this.jobProposalPaymentRepository.find({
        where: {
          job_proposal: {
            id: In(jobProposalIds),
          },
        },
        relations: ['job_proposal.job_basic', 'job_proposal'],
      });
      if (!jobProposalPayment.length) {
        return {
          status: 500,
          message: 'No Job payment found.',
        };
      }
      for (let j = 0; j < jobProposalPayment.length; j++) {
        jobProposalPayment[j].created_by = await this.getUser(
          jobProposalPayment[j].created_by,
        );
      }
      return jobProposalPayment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllUSerPayment(user_id: number) {
    try {
      const jobProposalPayment = await this.jobProposalPaymentRepository.find({
        where: {
          created_by: user_id,
        },
      });
      if (!jobProposalPayment.length) {
        return {
          status: 500,
          message: 'No User payment found.',
        };
      }
      return jobProposalPayment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createJobProposalReviewReply(
    data: CreateUserExpertiseReviewReplyDTO,
    user_id: number,
  ) {
    try {
      const review = await this.userExpertiseReviewRepository.findOne({
        where: {
          id: data.proposal_review_id,
        },
      });
      if (!review) {
        return {
          status: 500,
          message: 'No review found.',
        };
      }

      const userExpertiseReviewReply = new UserExpertiseReviewReply();
      userExpertiseReviewReply.message = data.message;
      userExpertiseReviewReply.created_by = user_id;
      userExpertiseReviewReply.user_expertise_review = review;
      await this.userExpertiseReviewReplyRepository.save(
        userExpertiseReviewReply,
      );
      return userExpertiseReviewReply;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobProposalReviewReply(data: any, id: number) {
    try {
      const reply = await this.userExpertiseReviewReplyRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!reply) {
        return {
          status: 500,
          message: 'No reply found.',
        };
      }
      if (data.proposal_review_id) {
        const review = await this.userExpertiseReviewRepository.findOne({
          where: {
            id: data.proposal_id,
          },
        });
        if (!review) {
          return {
            status: 500,
            message: 'No review found.',
          };
        }
        delete data.proposal_review_id;
        data.user_expertise_review = review;
      }
      await this.userExpertiseReviewReplyRepository.update(id, data);
      return {
        status: 200,
        message: 'reply updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobProposalReviewReplyById(id: number) {
    try {
      const reply = await this.userExpertiseReviewReplyRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!reply) {
        return {
          status: 500,
          message: 'No reply found.',
        };
      }
      await this.userExpertiseReviewReplyRepository.delete(id);
      return {
        status: 200,
        message: 'reply deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalReviewReplyByReviewId(id: number) {
    try {
      const reply = await this.userExpertiseReviewReplyRepository.find({
        where: {
          user_expertise_review: {
            id: id,
          },
        },
      });
      if (!reply.length) {
        return {
          status: 500,
          message: 'No reply found.',
        };
      }
      return reply;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createJobProposalBillingSetting(
    data: CreateJobProposalBillingSettingDTO,
    user_id: number,
  ) {
    try {
      const job_proposal = await this.jobProposalRepository.findOne({
        where: {
          id: data.job_proposal_id,
        },
      });
      if (!job_proposal) {
        return {
          status: 500,
          message: 'No job proposal found.',
        };
      }
      const jobProposalBillingSetting = new JobProposalBillingSettings();
      jobProposalBillingSetting.job_proposal = job_proposal;
      jobProposalBillingSetting.created_by = user_id;
      jobProposalBillingSetting.expertise_user_id = data.expertise_user_id;
      jobProposalBillingSetting.billing_frequency = data.billing_frequency;
      jobProposalBillingSetting.payment_type = data.payment_type;
      await this.jobProposalBillingSettingsRepository.save(
        jobProposalBillingSetting,
      );
      return jobProposalBillingSetting;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalBillingById(id: number, user_id: number) {
    try {
      const jobProposalBilling =
        await this.jobProposalBillingSettingsRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!jobProposalBilling) {
        return {
          status: 500,
          message: 'No job proposal Billing found.',
        };
      }
      return jobProposalBilling;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobProposalBilling(
    data: any,
    id: number,
    user_id: number,
  ) {
    try {
      const jobProposalBilling =
        await this.jobProposalBillingSettingsRepository.findOne({
          where: { id: id, created_by: user_id },
        });
      if (!jobProposalBilling) {
        return {
          status: 500,
          message: 'No job proposal billing found.',
        };
      }
      if (data.job_proposal_id) {
        const job_proposal = await this.jobProposalRepository.findOne({
          where: {
            id: data.job_proposal_id,
          },
        });
        if (!job_proposal) {
          return {
            status: 500,
            message: 'No job found.',
          };
        }
        delete data.job_proposal_id;
        data.job_proposal = job_proposal;
      }
      await this.jobProposalBillingSettingsRepository.update(id, data);
      return {
        status: 200,
        message: 'Job proposal Billing updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobJobProposalBilling(id: number, user_id: number) {
    try {
      const jobProposalBilling =
        await this.jobProposalBillingSettingsRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });
      if (!jobProposalBilling) {
        return {
          status: 500,
          message: 'No job proposal billing found.',
        };
      }
      await this.jobProposalBillingSettingsRepository.delete(id);
      return {
        status: 200,
        message: 'Job proposal billing deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalBillingByJobAndUserId(
    id: number,
    user_id: number,
  ) {
    try {
      const jobProposal: any = await this.jobProposalRepository.find({
        where: {
          job_basic: {
            id: id,
          },
        },
      });
      if (!jobProposal.length) {
        return {
          status: 500,
          message: 'No Job proposal found.',
        };
      }
      for (let i = 0; i < jobProposal.length; i++) {
        const jobProposalBilling =
          await this.jobProposalBillingSettingsRepository.find({
            where: {
              job_proposal: {
                id: jobProposal[i].id,
                created_by: user_id,
              },
            },
            relations: ['job_proposal', 'job_proposal.job_basic'],
          });
        if (!jobProposalBilling.length) {
          return {
            status: 500,
            message: 'No Job proposal billing found.',
          };
        }
        for (let j = 0; j < jobProposalBilling.length; j++) {
          jobProposalBilling[j].created_by = await this.getUser(
            jobProposalBilling[j].created_by,
          );
        }
        return jobProposalBilling;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
