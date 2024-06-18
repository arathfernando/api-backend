import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { CreateWorkspaceDTO } from 'src/core/dtos/workspace/workspace.dto';
import { Workspace } from 'src/database/entities/workspace.entity';
import { CreateWorkspaceCardDTO } from 'src/core/dtos/workspace/workspace-card.dto';
import { WorkspaceCards } from 'src/database/entities/workspace-cards.entity';
import { CreateWorkspaceMemberDTO } from 'src/core/dtos/workspace/workspace-member.dto';
import { WorkspaceMembers } from 'src/database/entities/workspace-member.entity';

import {
  CANVAS_MEMBER_STATUS,
  CANVAS_MEMBER_TYPE,
  PROJECT_OWNER_FILTER,
  PROJECT_SORT,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import { WorkspaceExpertDTO } from 'src/core/dtos/workspace/workspace-expert.dto';
import { ProjectGig, WorkspaceExpert } from 'src/database/entities';
import { WorkspaceFilterDTO } from 'src/core/dtos/workspace/workspace-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProjectFilterDto } from 'src/core/dtos/project-filter.dto';
import { IMailPayload } from 'src/core/interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WorkspaceService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @InjectRepository(ProjectGig)
    private readonly projectGigRepository: Repository<ProjectGig>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceCards)
    private readonly workspaceCardsRepository: Repository<WorkspaceCards>,
    @InjectRepository(WorkspaceMembers)
    private readonly workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(WorkspaceExpert)
    private readonly workspaceExpertRepository: Repository<WorkspaceExpert>,
    private readonly configService: ConfigService,
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

  public async getUserByEmail(email: string): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_email', { email: email }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  public async getWorkspaceCategoryById(id: number): Promise<any> {
    const category = await firstValueFrom(
      this.adminClient.send('get_workspace_category_by_id', id),
    );

    return category;
  }

  public async getWorkspaceCardTypeById(id: number): Promise<any> {
    const innovationCategory = await firstValueFrom(
      this.adminClient.send('get_workspace_card_type_by_id', id),
    );
    return innovationCategory;
  }

  public async createWorkspace(
    data: CreateWorkspaceDTO,
    user_id: number,
  ): Promise<any> {
    try {
      const workspace = new Workspace();
      workspace.workspace_type = data.workspace_type;
      workspace.name = data.name;
      workspace.project_id = data.project_id;
      workspace.created_by = user_id;
      await this.workspaceRepository.save(workspace);
      if (data.workspace_member) {
        const workspaceDetails = {
          workspace_id: workspace.id,
          status: CANVAS_MEMBER_STATUS.PENDING,
          member_type: CANVAS_MEMBER_TYPE.MEMBER,
          user_id: data.workspace_member,
        };
        await this.createWorkspaceMember(workspaceDetails, user_id);
      }
      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateWorkspace(id: number, data: any): Promise<any> {
    try {
      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }
      await this.workspaceRepository.update(id, data);
      return {
        status: 200,
        message: 'workspace updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }
  public async getAllWorkspace(
    data: ProjectFilterDto,
    user_id: number,
  ): Promise<any> {
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
        take: newD.take,
        skip: newD.skip,
      };

      if (data.owner) {
        if (data.owner == PROJECT_OWNER_FILTER.CREATED_BY_ME) {
          whereConn.where.created_by = user_id;
        }
        if (data.owner == PROJECT_OWNER_FILTER.ANYONE) {
          // whereConn.where.created_by = user_id;
        }
      }
      if (data.search) {
        const workspaceSearch: any = await this.workspaceRepository
          .createQueryBuilder('workspace')
          .where('LOWER(workspace.name) LIKE LOWER(:data)', {
            data: `%${data.search}%`,
          })
          .getMany();
        const dataIds = await this.arrayColumn(workspaceSearch, 'id');
        whereConn.where.id = In(dataIds);
      }
      if (data.sort_by) {
        if (data.sort_by == PROJECT_SORT.TITLE_NAME) {
          whereConn.order = { name: 'ASC' };
        }
      }
      const workspace: any = await this.workspaceRepository.find(whereConn);
      for (let i = 0; i < workspace.length; i++) {
        workspace[i].workspace_type = await this.getWorkspaceCategoryById(
          workspace[i].workspace_type,
        );
        workspace[i].created_by = await this.getUser(workspace[i].created_by);
      }
      const total = await this.workspaceRepository.count(whereConn);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: workspace,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceById(id: number, user_id: number): Promise<any> {
    try {
      const workspace: any = await this.workspaceRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }
      for (let i = 0; i < workspace.length; i++) {
        workspace[i].workspace_type = await this.getWorkspaceCategoryById(
          workspace[i].workspace_type,
        );
      }
      const currUser = await this.getUser(user_id);
      const member = await this.workspaceMembersRepository.count({
        where: {
          workspace: { id: workspace.id },
          user_id: currUser.email,
        },
      });
      const current_user_expert_status =
        await this.workspaceExpertRepository.findOne({
          where: {
            workspace: {
              id: id,
            },
            gig: {
              created_by: user_id,
            },
          },
          order: {
            id: 'DESC',
          },
        });
      const category = await this.getWorkspaceCategoryById(
        workspace.workspace_type,
      );
      workspace.workspace_type = category;
      workspace.current_user_expert_status = current_user_expert_status
        ? current_user_expert_status
        : null;
      workspace.is_member = member != 0 ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE;
      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceByProjectId(id: number): Promise<any> {
    try {
      const workspace: any = await this.workspaceRepository.find({
        where: {
          project_id: id,
        },
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }
      for (let i = 0; i < workspace.length; i++) {
        workspace[i].workspace_type = await this.getWorkspaceCategoryById(
          workspace[i].workspace_type,
        );
      }
      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getWorkspaceWorkspaceById(id: number): Promise<any> {
    try {
      const workspace: any = await this.workspaceRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }
      workspace.workspace_type = await this.getWorkspaceCategoryById(
        workspace.workspace_type,
      );
      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteWorkspace(id: number): Promise<any> {
    try {
      const workspace: any = await this.workspaceRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }
      await this.workspaceRepository.delete(id);
      return {
        status: 200,
        message: 'workspace deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createWorkspaceCard(
    data: CreateWorkspaceCardDTO,
    user_id: number,
  ): Promise<any> {
    try {
      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: data.workspace_id,
        },
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }
      const workspaceCards = new WorkspaceCards();
      workspaceCards.workspace = workspace;
      workspaceCards.background_color = data.background_color;
      workspaceCards.created_by = user_id;
      workspaceCards.title = data.title;
      workspaceCards.description = data.description;
      workspaceCards.workspace_card_type = data.workspace_card_type;
      workspaceCards.attachments = data.attachments ? data.attachments : [];
      await this.workspaceCardsRepository.save(workspaceCards);
      return workspaceCards;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateWorkspaceCard(id: number, data: any): Promise<any> {
    try {
      const workspaceCards = await this.workspaceCardsRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!workspaceCards) {
        return {
          status: 500,
          message: 'No workspace card found.',
        };
      }
      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: data.workspace_id,
        },
      });

      data.workspace = workspace;
      delete data.workspace_id;
      await this.workspaceCardsRepository.update(id, data);
      return {
        status: 200,
        message: 'workspace card updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceCardByCardType(id: number): Promise<any> {
    try {
      const workspaceCards: any = await this.workspaceCardsRepository.find({
        where: {
          workspace_card_type: id,
        },
      });
      if (!workspaceCards.length) {
        return {
          status: 500,
          message: 'No workspace cards found.',
        };
      }
      for (let i = 0; i < workspaceCards.length; i++) {
        workspaceCards[i].workspace_card_type =
          await this.getWorkspaceCardTypeById(
            workspaceCards[i].workspace_card_type,
          );
      }
      return workspaceCards;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteWorkspaceCard(id: number): Promise<any> {
    try {
      const workspaceCards: any = await this.workspaceCardsRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!workspaceCards) {
        return {
          status: 500,
          message: 'No workspace cards found.',
        };
      }
      await this.workspaceCardsRepository.delete(id);
      return {
        status: 200,
        message: 'workspace cards deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createWorkspaceMember(
    data: CreateWorkspaceMemberDTO,
    user_id: number,
  ): Promise<any> {
    try {
      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: data.workspace_id,
        },
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }
      const saveArr = [];
      for (let i = 0; i < data.user_id.length; i++) {
        const workspaceMembers = new WorkspaceMembers();
        workspaceMembers.workspace = workspace;
        workspaceMembers.created_by = user_id;
        workspaceMembers.status = data.status;
        workspaceMembers.user_id = data.user_id[i];
        saveArr.push(workspaceMembers);
        const invitedUser = await this.getUserByEmail(data.user_id[i]);
        await this.workspaceMembersRepository.save(saveArr);
        const user = await this.getUser(user_id);
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'EXPERT_INVITED',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace(
              '*username*',
              user && user.general_profile
                ? user.general_profile.first_name
                : '',
            )
            .replace('*workspace name*', workspace.name),
          content: admin_notification.notification_content
            .replace(
              '*username*',
              user && user.general_profile
                ? user.general_profile.first_name
                : '',
            )
            .replace('*workspace name*', workspace.name),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: invitedUser.id,
          payload: saveArr,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );
        const payload: IMailPayload = {
          template: 'INVITE_EXPERT',
          payload: {
            emails: [invitedUser.email],
            data: {
              name:
                user && user.general_profile
                  ? `${user.general_profile.first_name} ${user.general_profile.last_name}`
                  : '',
              link: `${this.configService.get<string>(
                'project_investor_url',
              )}/project/lean-canvas/${workspace?.id}`,
            },
            subject: `You have been invited to a new workspace`,
          },
        };

        this.mailClient.emit('send_email', payload);
      }
      return saveArr;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateWorkspaceMember(id: number, data: any): Promise<any> {
    try {
      const workspaceMember = await this.workspaceMembersRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!workspaceMember) {
        return {
          status: 500,
          message: 'No workspace member found.',
        };
      }
      if (data.workspace_id) {
        const workspace = await this.workspaceRepository.findOne({
          where: {
            id: data.workspace_id,
          },
        });
        if (!workspace) {
          return {
            status: 500,
            message: 'No workspace found.',
          };
        }
        delete data.workspace_id;
        data.workspace = workspace;
      }
      await this.workspaceMembersRepository.update(id, data);
      return {
        status: 200,
        message: 'workspace member updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceMemberByWorkspace(id: number): Promise<any> {
    try {
      const workspaceMembers: any = await this.workspaceMembersRepository.find({
        where: {
          workspace: {
            id: id,
          },
        },
      });
      if (!workspaceMembers.length) {
        return {
          status: 500,
          message: 'No workspace member found.',
        };
      }
      for (let i = 0; i < workspaceMembers.length; i++) {
        workspaceMembers[i].created_by = await this.getUser(
          workspaceMembers[i].created_by,
        );
        workspaceMembers[i].user_id = await this.getUserByEmail(
          workspaceMembers[i].user_id,
        );
      }
      return workspaceMembers;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteWorkspaceMember(id: number): Promise<any> {
    try {
      const workspaceMember: any =
        await this.workspaceMembersRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!workspaceMember) {
        return {
          status: 500,
          message: 'No workspace member found.',
        };
      }
      await this.workspaceMembersRepository.delete(id);
      return {
        status: 200,
        message: 'workspace member deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllExpertise(workspace_id: number): Promise<any> {
    try {
      const expertise: any = await this.projectGigRepository.find({
        where: {
          workspace_id: workspace_id,
        },
      });
      for (let i = 0; i < expertise.length; i++) {
        expertise[i].created_by = await this.getUser(expertise[i].created_by);
      }
      return expertise;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async inviteExpert(
    data: WorkspaceExpertDTO,
    user_id: number,
  ): Promise<any> {
    try {
      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: data.workspace_id,
        },
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }

      const projectGig = await this.projectGigRepository.findOne({
        where: {
          id: data.gig_id,
        },
      });
      if (!projectGig) {
        return {
          status: 500,
          message: 'No project gig found.',
        };
      }
      const inviteExperts = new WorkspaceExpert();
      inviteExperts.workspace = workspace;
      inviteExperts.invited_by = user_id;
      inviteExperts.gig = projectGig;
      inviteExperts.invite_status = data.invite_status;
      await this.workspaceExpertRepository.save(inviteExperts);
      return inviteExperts;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateInviteExpert(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const workspaceExpert = await this.workspaceExpertRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!workspaceExpert) {
        return {
          status: 500,
          message: 'No workspace Expert found.',
        };
      }
      if (data.workspace_id) {
        const workspace = await this.workspaceRepository.findOne({
          where: {
            id: data.workspace_id,
          },
        });
        if (!workspace) {
          return {
            status: 500,
            message: 'No workspace found.',
          };
        }
        delete data.workspace_id;
        data.workspace = workspace;
        data.invited_by = user_id;
      }

      if (data.gig_id) {
        const projectGig = await this.projectGigRepository.findOne({
          where: {
            id: data.gig_id,
          },
        });
        if (!projectGig) {
          return {
            status: 500,
            message: 'No project gig found.',
          };
        }
        delete data.gig_id;
        data.gig = projectGig;
        data.invited_by = user_id;
      }
      await this.workspaceExpertRepository.update(id, data);
      return {
        status: 200,
        message: 'workspace Expert updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getInviteExpertByWorkspaceId(
    id: number,
    data: WorkspaceFilterDTO,
  ): Promise<any> {
    try {
      const whereConn: any = {
        where: {
          workspace: {
            id: id,
          },
        },
        relations: ['gig', 'workspace'],
      };
      if (data.invite_status) {
        whereConn.where.invite_status = data.invite_status;
      }
      const workspaceExpert: any =
        await this.workspaceExpertRepository.find(whereConn);
      if (!workspaceExpert.length) {
        return {
          status: 500,
          message: 'No workspace Expert found.',
        };
      }
      return workspaceExpert;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteInviteExpert(id: number): Promise<any> {
    try {
      const workspaceExpert: any = await this.workspaceExpertRepository.findOne(
        {
          where: {
            id: id,
          },
        },
      );
      if (!workspaceExpert) {
        return {
          status: 500,
          message: 'No workspace Expert found.',
        };
      }
      await this.workspaceExpertRepository.delete(id);
      return {
        status: 200,
        message: 'workspace Expert deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceCardByWorkspaceId(id: number): Promise<any> {
    try {
      const workspaceCards: any = await this.workspaceCardsRepository.find({
        where: {
          workspace: {
            id: id,
          },
        },
      });
      if (!workspaceCards.length) {
        return {
          status: 500,
          message: 'No workspace cards found.',
        };
      }
      return workspaceCards;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigCategoryCardByCategoryId(id: number): Promise<any> {
    try {
      const workspace = await firstValueFrom(
        this.adminClient.send('get_workspace_card_type_by_category_id', id),
      );
      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWorkspaceByGigId(gig_id: number): Promise<any> {
    try {
      const gig = await this.workspaceExpertRepository.find({
        where: {
          gig: {
            id: gig_id,
          },
        },
        relations: ['gig', 'workspace'],
      });
      for (let i = 0; i < gig.length; i++) {
        gig[i].workspace.workspace_type = await this.getWorkspaceCategoryById(
          gig[i].workspace.workspace_type,
        );
        gig[i].invited_by = await this.getUser(gig[i].invited_by);
      }
      return gig;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getInviteExpertByGigId(
    gig_id: number,
    data: WorkspaceFilterDTO,
  ): Promise<any> {
    try {
      const whereConn: any = {
        where: {
          gig: {
            id: gig_id,
          },
        },
        relations: ['workspace'],
      };
      if (data.invite_status) {
        whereConn.where.invite_status = data.invite_status;
      }
      const workspaceExpert: any =
        await this.workspaceExpertRepository.find(whereConn);
      if (!workspaceExpert.length) {
        return {
          status: 500,
          message: 'No workspace Expert found.',
        };
      }
      for (let i = 0; i < workspaceExpert.length; i++) {
        workspaceExpert[i].workspace.workspace_type =
          await this.getWorkspaceCategoryById(
            workspaceExpert[i].workspace.workspace_type,
          );
        workspaceExpert[i].invited_by = await this.getUser(
          workspaceExpert[i].invited_by,
        );
      }
      return workspaceExpert;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getInviteExpertByProjectId(id: number): Promise<any> {
    try {
      const workspace: any = await this.workspaceRepository.find({
        where: {
          project_id: id,
        },
        relations: ['workspace_expert'],
      });
      if (!workspace) {
        return {
          status: 500,
          message: 'No workspace found.',
        };
      }

      return workspace;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
