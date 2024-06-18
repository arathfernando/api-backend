import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import WorkspaceType from 'src/database/entities/workspace-type.entity';
import { CreateWorkspaceTypeDto } from 'src/helper/dtos/workspace/workspace-type.dto';
import { CreateWorkspaceCardTypeDto } from 'src/helper/dtos/workspace/workspace-card-type.dto';

import { S3Service } from 'src/helper/services/s3/s3.service';
import WorkspaceCardType from 'src/database/entities/workspace-card-type.entity';
import { CreateWorkspaceDTO } from 'src/helper/dtos/workspace/workspace.dto';
import { CreateWorkspaceMemberDTO } from 'src/helper/dtos/workspace/workspace-member.dto';
import { WorkspaceExpertDTO } from 'src/helper/dtos/workspace/workspace-expert.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WorkspaceService {
  constructor(
    @Inject('PRODUCT_LAUNCHER')
    private readonly marketPlaceClient: ClientProxy,
    private readonly s3Service: S3Service,
    @InjectRepository(WorkspaceType)
    private readonly workspaceTypeRepository: Repository<WorkspaceType>,
    @InjectRepository(WorkspaceCardType)
    private readonly workspaceCardTypeRepository: Repository<WorkspaceCardType>,
  ) {}

  async createWorkspaceCategory(
    data: CreateWorkspaceTypeDto,
    icon: any,
    co_created_with: any,
  ): Promise<any> {
    try {
      let logo;
      let co_created;

      if (icon) {
        logo = await this.s3Service.uploadFile(icon);
      }
      if (co_created_with) {
        co_created = await this.s3Service.uploadFile(co_created_with);
      }
      const workspaceType = new WorkspaceType();
      workspaceType.co_created_with = co_created?.Location;
      workspaceType.icon = logo?.Location;
      workspaceType.description = data.description;
      workspaceType.short_description = data.short_description;
      workspaceType.label = data.label;
      workspaceType.title = data.title;
      await this.workspaceTypeRepository.save(workspaceType);
      return workspaceType;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateWorkspaceCategory(
    id: number,
    data: any,
    icon: any,
    co_created_with: any,
  ): Promise<any> {
    try {
      const cardType = await this.workspaceTypeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!cardType) {
        return {
          status: 500,
          message: 'No workspace type found.',
        };
      }
      let logo;
      let co_created;

      if (icon) {
        logo = await this.s3Service.uploadFile(icon);
        delete data.icon;
        data.icon = logo.Location;
      }
      if (co_created_with) {
        co_created = await this.s3Service.uploadFile(co_created_with);
        delete data.co_created_with;
        data.co_created_with = co_created.Location;
      }
      await this.workspaceTypeRepository.update(id, data);
      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceCategoryById(id: number): Promise<any> {
    try {
      const cardType = await this.workspaceTypeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!cardType) {
        return {
          status: 500,
          message: 'No workspace type found.',
        };
      }
      return cardType;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceCategory(): Promise<any> {
    try {
      return await this.workspaceTypeRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteWorkspaceCategory(id: number): Promise<any> {
    try {
      const cardType = await this.workspaceTypeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!cardType) {
        return {
          status: 500,
          message: 'No workspace type found.',
        };
      }
      await this.workspaceTypeRepository.delete(id);
      return {
        status: 200,
        message: 'Category deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createWorkspaceCardType(
    data: CreateWorkspaceCardTypeDto,
  ): Promise<any> {
    try {
      const workspace_category = await this.workspaceTypeRepository.findOne({
        where: {
          id: data.workspace_category_id,
        },
      });
      if (!workspace_category) {
        return {
          status: 500,
          message: 'No workspace category found.',
        };
      }

      const workspaceCardType = new WorkspaceCardType();
      workspaceCardType.title = data.title;
      workspaceCardType.order = data.order;
      workspaceCardType.description = data.description;
      workspaceCardType.workspace_type = workspace_category;
      await this.workspaceCardTypeRepository.save(workspaceCardType);

      return workspaceCardType;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateWorkspaceCardType(id: number, data: any): Promise<any> {
    try {
      const cardType = await this.workspaceCardTypeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!cardType) {
        return {
          status: 500,
          message: 'No workspace card type found.',
        };
      }
      if (data.workspace_category_id) {
        const workspace_category = await this.workspaceTypeRepository.findOne({
          where: {
            id: data.workspace_category_id,
          },
        });
        if (!workspace_category) {
          return {
            status: 500,
            message: 'No workspace category found.',
          };
        }
        delete data.workspace_category_id;
        data.workspace_type = workspace_category;
      }
      await this.workspaceCardTypeRepository.update(id, data);
      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigCategoryCardByCategoryId(id: number): Promise<any> {
    try {
      const cardType = await this.workspaceCardTypeRepository.find({
        where: {
          workspace_type: {
            id: id,
          },
        },
      });
      if (!cardType) {
        return {
          status: 500,
          message: 'No workspace card type found.',
        };
      }
      return cardType;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceCardTypeById(id: number): Promise<any> {
    try {
      const cardType = await this.workspaceCardTypeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!cardType) {
        return {
          status: 500,
          message: 'No workspace card type found.',
        };
      }
      return cardType;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceCardType(): Promise<any> {
    try {
      const workspaceCard = await this.workspaceCardTypeRepository.find({
        relations: ['workspace_type'],
      });
      return workspaceCard || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteWorkspaceCardType(id: number): Promise<any> {
    try {
      const cardType = await this.workspaceCardTypeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!cardType) {
        return {
          status: 500,
          message: 'No workspace card type found.',
        };
      }
      await this.workspaceCardTypeRepository.delete(id);
      return {
        status: 200,
        message: 'Category deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createWorkspace(data: CreateWorkspaceDTO): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send('add_workspace', JSON.stringify(data)),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceByProjectId(id: number): Promise<any> {
    try {
      const workspace = await firstValueFrom(
        this.marketPlaceClient.send('get_workspace_by_id', id),
      );
      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createWorkspaceMember(data: CreateWorkspaceMemberDTO): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send(
          'add_workspace_member',
          JSON.stringify(data),
        ),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async inviteExpert(data: WorkspaceExpertDTO): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send(
          'invite_workspace_expert',
          JSON.stringify(data),
        ),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getInviteExpertByProjectId(id: number): Promise<any> {
    try {
      const workspace = await firstValueFrom(
        this.marketPlaceClient.send('get_invite_expert_by_project_id', id),
      );
      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
