import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import JobsSkill from 'src/database/entities/jobs-skill.entity';
import {
  CreateJobBasicDTO,
  UpdateJobBasicDTO,
} from 'src/helper/dtos/jobs/job-basic.dto';
import {
  CreateJobProposalDTO,
  UpdateJobProposalDTO,
} from 'src/helper/dtos/jobs/job-proposal.dto';
import { CreateJobSkillDTO } from 'src/helper/dtos/jobs/job-skill.dto';
import {
  CreateUserExpertiseReviewDTO,
  UpdateUserExpertiseReviewDTO,
} from 'src/helper/dtos/jobs/user-expertise-review.dto';
import { In, Repository } from 'typeorm';

@Injectable()
export class JobService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('PRODUCT_LAUNCHER')
    private readonly productLauncherClient: ClientProxy,
    @InjectRepository(JobsSkill)
    private readonly jobsSkillRepository: Repository<JobsSkill>,
  ) {}

  async createJob(data: CreateJobBasicDTO): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.productLauncherClient.send('add_job', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJob(data: UpdateJobBasicDTO, id: number): Promise<any> {
    try {
      const new_data: any = data;
      new_data.id = id;
      return await firstValueFrom(
        this.productLauncherClient.send('update_job', JSON.stringify(new_data)),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobById(id: number): Promise<any> {
    try {
      const job = await firstValueFrom(
        this.productLauncherClient.send('get_job_by_id', id),
      );
      return job;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllUserJobs(data: any): Promise<any> {
    try {
      const job = await firstValueFrom(
        this.productLauncherClient.send('get_all_job', JSON.stringify(data)),
      );
      return job;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobById(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.productLauncherClient.send('delete_job', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createJobProposal(data: CreateJobProposalDTO): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.productLauncherClient.send(
          'add_job_proposal',
          JSON.stringify(data),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobProposal(
    data: UpdateJobProposalDTO,
    id: number,
  ): Promise<any> {
    try {
      const new_data: any = data;
      new_data.id = id;
      return await firstValueFrom(
        this.productLauncherClient.send(
          'update_job_proposal',
          JSON.stringify(new_data),
        ),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalById(id: number): Promise<any> {
    try {
      const jobProposal = await firstValueFrom(
        this.productLauncherClient.send('get_job_proposal_by_id', id),
      );
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalByJobId(id: number, filter: string): Promise<any> {
    try {
      const data: any = filter;
      const jobProposal = await firstValueFrom(
        this.productLauncherClient.send(
          'get_job_proposal_by_job_id',
          JSON.stringify({
            id: id,
            data: data,
          }),
        ),
      );
      return jobProposal;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobProposalById(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.productLauncherClient.send('delete_job_proposal', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createJobProposalReview(
    data: CreateUserExpertiseReviewDTO,
  ): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.productLauncherClient.send(
          'add_job_proposal_review',
          JSON.stringify(data),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateJobProposalReview(
    data: UpdateUserExpertiseReviewDTO,
    id: number,
  ): Promise<any> {
    try {
      const new_data: any = data;
      new_data.id = id;
      return await firstValueFrom(
        this.productLauncherClient.send(
          'update_job_proposal_review',
          JSON.stringify(new_data),
        ),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getJobProposalReviewById(id: number): Promise<any> {
    try {
      const review = await firstValueFrom(
        this.productLauncherClient.send('get_job_proposal_review_by_id', id),
      );
      return review;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllProposalReview(data: any): Promise<any> {
    try {
      const review = await firstValueFrom(
        this.productLauncherClient.send('get_all_review', JSON.stringify(data)),
      );
      return review;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteJobProposalReviewById(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.productLauncherClient.send('delete_job_proposal_review', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createJobSkill(data: CreateJobSkillDTO): Promise<any> {
    try {
      const response = [];
      for (let i = 0; i < data.skill.length; i++) {
        const create = new JobsSkill();
        create.skill = data.skill[i];
        create.created_by = data.created_by;
        await this.jobsSkillRepository.save(create);
        response.push(create);
      }
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateJobSkill(id: number, data: any): Promise<any> {
    try {
      const jobSkill = await this.jobsSkillRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!jobSkill) {
        return {
          status: 500,
          message: 'No Job Skill found.',
        };
      }
      await this.jobsSkillRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllJobSkill(data: any): Promise<any> {
    try {
      const jobSkill = await this.jobsSkillRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
      });
      if (!jobSkill.length) {
        return {
          status: 500,
          message: 'No Job Skill found.',
        };
      }
      for (let i = 0; i < jobSkill.length; i++) {
        const user = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(jobSkill[i].created_by),
          }),
        );

        delete user.password;
        delete user.verification_code;
        delete user.reset_password_otp;
        delete jobSkill[i].created_by;
        jobSkill[i].created_by = user;
      }
      return jobSkill;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getJobSkillById(id: number): Promise<any> {
    try {
      const jobSkill = await this.jobsSkillRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!jobSkill) {
        return {
          status: 500,
          message: 'No Job Skill found.',
        };
      }
      return jobSkill;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteJobSkill(id: number): Promise<any> {
    try {
      const jobSkill = await this.jobsSkillRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!jobSkill) {
        return {
          status: 500,
          message: 'No Job Skill found.',
        };
      }
      await this.jobsSkillRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSkillByIdsData(ids: any): Promise<any> {
    try {
      const jobSkills = await this.jobsSkillRepository.find({
        where: {
          id: In(ids),
        },
      });

      return jobSkills || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
