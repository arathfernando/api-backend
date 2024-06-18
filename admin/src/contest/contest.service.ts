import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateContestCriteriaDto,
  CreateContestDto,
  CreateContestRuleDto,
  CreateContestTemplateDto,
  CreateCustomerIdentityDto,
  GetByIdDto,
  GetContestantDto,
  GetContestByState,
  UpdateContestantDto,
} from 'src/helper/dtos';
import { AddContestant } from 'src/helper/dtos/add-contestant.dto';
import { S3Service } from 'src/helper/services/s3/s3.service';

@Injectable()
export class ContestService {
  constructor(
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) {
    this.communityClient.connect();
  }

  async createContest(data: CreateContestDto, file: any): Promise<any> {
    try {
      let avatar;

      if (file) {
        avatar = await this.s3Service.uploadFile(file);
      }

      if (avatar) {
        data.contest_cover = avatar.Location;
      }
      const createdRes = await firstValueFrom(
        this.communityClient.send('add_contest', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateContest(id: number, data: any, file: any): Promise<any> {
    try {
      data.id = id;
      let avatar;

      if (file) {
        avatar = await this.s3Service.uploadFile(file);
      }

      if (avatar) {
        data.contest_cover = avatar.Location;
      }
      const updatedRes = await firstValueFrom(
        this.communityClient.send('update_contest', JSON.stringify(data)),
      );
      return updatedRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createCustomerIdentity(
    data: CreateCustomerIdentityDto,
    file: any,
  ): Promise<any> {
    try {
      let company_logo;
      if (file) {
        company_logo = await this.s3Service.uploadFile(file);
        data.company_logo = company_logo.Location;
      }

      const createRes = await firstValueFrom(
        this.communityClient.send(
          'create_contest_customer_identity',
          JSON.stringify(data),
        ),
      );
      return createRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCustomerIdentity(
    id: number,
    data: any,
    file: any,
  ): Promise<any> {
    try {
      data.id = id;
      let company_logo;
      if (file) {
        company_logo = await this.s3Service.uploadFile(file);
        data.company_logo = company_logo.Location;
      }
      return await firstValueFrom(
        this.communityClient.send(
          'update_contest_customer_identity',
          JSON.stringify(data),
        ),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestById(id: number): Promise<any> {
    try {
      const contest = await firstValueFrom(
        this.communityClient.send('get_contest_by_id', id),
      );
      return contest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteContest(id: number): Promise<any> {
    try {
      await firstValueFrom(this.communityClient.send('delete_contest', id));
      return {
        status: 200,
        message: 'Contest deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestCustomerIdentity(id: number): Promise<any> {
    try {
      const contest = await firstValueFrom(
        this.communityClient.send('get_contest_customer_identity', id),
      );
      return contest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createContestCriteria(
    data: CreateContestCriteriaDto,
  ): Promise<any> {
    try {
      const criteriaCreated = await firstValueFrom(
        this.communityClient.send(
          'create_contest_criteria',
          JSON.stringify(data),
        ),
      );
      return criteriaCreated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateContestCriteria(id: number, data: any): Promise<any> {
    data.id = id;
    await firstValueFrom(
      this.communityClient.send(
        'update_contest_criteria',
        JSON.stringify(data),
      ),
    );
    return {
      status: 200,
      message: 'Customer criteria updated successfully',
    };
  }

  public async getContestCriteria(id: number): Promise<any> {
    try {
      const contestCriteria = await firstValueFrom(
        this.communityClient.send('get_contest_criteria', id),
      );
      return contestCriteria;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createContestRules(data: CreateContestRuleDto): Promise<any> {
    try {
      const contestRule = await firstValueFrom(
        this.communityClient.send('create_contest_rule', JSON.stringify(data)),
      );
      return contestRule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateContestRule(id: number, data: any): Promise<any> {
    try {
      data.id = id;
      await firstValueFrom(
        this.communityClient.send('update_contest_rule', JSON.stringify(data)),
      );

      return {
        status: 200,
        message: 'Contest Rules updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestRules(id: number): Promise<any> {
    try {
      const contestRule = await firstValueFrom(
        this.communityClient.send('get_contest_rule', id),
      );
      return contestRule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestByState(state: GetContestByState): Promise<any> {
    try {
      const contestRule = await firstValueFrom(
        this.communityClient.send(
          'get_contest_by_state',
          JSON.stringify(state),
        ),
      );
      return contestRule;
    } catch (e) {}
  }

  public async getContestantByContestId(data: GetContestantDto): Promise<any> {
    try {
      const contest_id = data.contest_id ? data.contest_id : 0;
      const contestRule = await firstValueFrom(
        this.communityClient.send(
          'get_contestant',
          JSON.stringify({
            contest_id: contest_id,
            status: data.status,
            role: data.role,
          }),
        ),
      );

      return contestRule;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async addContestant(data: AddContestant): Promise<any> {
    try {
      const contestRule = await firstValueFrom(
        this.communityClient.send('add_contestant', JSON.stringify(data)),
      );
      return contestRule;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getRevision(): Promise<any> {
    try {
      const contestRule = await firstValueFrom(
        this.communityClient.send('get_revision', {}),
      );
      return contestRule;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async getRevisionByContest(contest_id: number): Promise<any> {
    try {
      const contestRule = await firstValueFrom(
        this.communityClient.send('get_revision_by_contest', contest_id),
      );
      return contestRule;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  public async updateContestantById(
    id: GetByIdDto,
    data: UpdateContestantDto,
  ): Promise<any> {
    try {
      await firstValueFrom(
        this.communityClient.send(
          'update_contestant',
          JSON.stringify({ status: data.status, id: id.id }),
        ),
      );
      return {
        status: 200,
        message: 'Contestant updated successfully',
      };
    } catch (e) {}
  }

  public async deleteContestRevision(id: number): Promise<any> {
    try {
      await firstValueFrom(
        this.communityClient.send('delete_contest_revision', id),
      );
      return {
        status: 200,
        message: 'Contest revision deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createContestTemplate(
    data: CreateContestTemplateDto,
    files: Express.Multer.File[],
  ): Promise<any> {
    try {
      const fileUrls = [];
      await Promise.all(
        files.map(async (file) => {
          const f = await this.s3Service.uploadFile(file);
          fileUrls.push(f.Location);
        }),
      );
      data.attachments = fileUrls;
      const contestRule = await firstValueFrom(
        this.communityClient.send(
          'create_contest_template',
          JSON.stringify(data),
        ),
      );
      return contestRule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateContestTemplate(
    id: number,
    data: any,
    files: Express.Multer.File[],
  ): Promise<any> {
    try {
      data.id = id;
      const fileArr = [];
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const f = await this.s3Service.uploadFile(file);
            fileArr.push(f.Location);
          }),
        );
        data.attachments = fileArr;
      }

      await firstValueFrom(
        this.communityClient.send(
          'update_contest_template',
          JSON.stringify(data),
        ),
      );

      return {
        status: 200,
        message: 'Contest Template updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestTemplates(data: any): Promise<any> {
    try {
      const templates = await firstValueFrom(
        this.communityClient.send(
          'get_contest_templates',
          JSON.stringify(data),
        ),
      );

      return templates;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getContestTemplateById(id: number): Promise<any> {
    try {
      const template = await firstValueFrom(
        this.communityClient.send('get_contest_template', JSON.stringify(id)),
      );

      return template;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteContestTemplate(id: number): Promise<any> {
    try {
      const template = await firstValueFrom(
        this.communityClient.send(
          'delete_contest_template',
          JSON.stringify(id),
        ),
      );

      return template;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async removeContestant(id: number): Promise<any> {
    try {
      const template = await firstValueFrom(
        this.communityClient.send(
          'remove_contest_contestant',
          JSON.stringify(id),
        ),
      );

      return template;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
