import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  PROJECT_OWNER_FILTER,
  PROJECT_SORT,
  PROJECT_STATUS,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  ProjectAssessment,
  ProjectBasic,
  ProjectMember,
} from 'src/database/entities';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { AssessmentDto } from 'src/core/dtos/project-assessment.dto';
import { ProjectMemberDto, SearchDataDto } from 'src/core/dtos';
import { ILike, In, Repository } from 'typeorm';
import { ProjectFilterDto } from 'src/core/dtos/project-filter.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IMailPayload } from 'src/core/interfaces';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    private readonly s3Service: S3Service,
    @InjectRepository(ProjectBasic)
    private readonly projectBasicRepository: Repository<ProjectBasic>,
    @InjectRepository(ProjectAssessment)
    private readonly projectAssessmentRepository: Repository<ProjectAssessment>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
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

  public async getProjectCategoryById(id: number): Promise<any> {
    const category = await firstValueFrom(
      this.adminClient.send('get_product_category_by_id', id),
    );

    return category;
  }

  public async getBasicTypeByIds(ids: number[]): Promise<any> {
    const basicType = await firstValueFrom(
      this.adminClient.send('get_basic_type_ids', JSON.stringify(ids)),
    );

    return basicType;
  }

  public async getProjectGoalByIds(ids: number[]): Promise<any> {
    const projectGoals = await firstValueFrom(
      this.adminClient.send<any>('get_goal_by_ids', JSON.stringify(ids)),
    );

    return projectGoals;
  }

  public async createProject(
    data: any,
    avatar: any,
    user_id: number,
  ): Promise<any> {
    try {
      let project_img;

      if (avatar && typeof avatar != 'string') {
        avatar = await this.s3Service.uploadFile(avatar);
        project_img = avatar.Location;
      } else {
        project_img = avatar;
      }
      const projectBasic = new ProjectBasic();
      projectBasic.project_name = data.project_name;
      projectBasic.project_description = data.project_description;
      projectBasic.product_category = data.product_category;
      projectBasic.goals = data.goals ? data.goals.split(',') : [];
      projectBasic.innovation_category = data.innovation_category
        ? data.innovation_category.split(',')
        : [];
      projectBasic.tech_category = data.tech_category
        ? data.tech_category.split(',')
        : [];
      projectBasic.status = data.status ? data.status : PROJECT_STATUS.PENDING;
      projectBasic.project_market = data.project_market;
      projectBasic.price = data.price;
      projectBasic.country = data.country;
      projectBasic.language = data.language;
      projectBasic.created_by = user_id;
      projectBasic.project_image = project_img;
      projectBasic.launch_type = data.launch_type;
      await this.projectBasicRepository.save(projectBasic);
      return projectBasic;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateProject(
    id: number,
    data: any,
    avatar: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where = user_id == 0 ? { id: id } : { id: id, created_by: user_id };
      const project = await this.projectBasicRepository.findOne({
        where: {
          ...where,
          id: id,
        },
      });

      if (!project) {
        return {
          status: 500,
          message: 'Project not found.',
        };
      }

      if (avatar) {
        avatar = await this.s3Service.uploadFile(avatar);
        avatar = avatar.Location;
        delete data.project_image;
        data.project_image = avatar;
      }
      if (data.goals == '') {
        data.goals = [];
      } else if (data.goals) {
        data.goals = data.goals.split(',');
      }
      if (data.innovation_category == '') {
        data.innovation_category = [];
      } else if (data.innovation_category) {
        data.innovation_category = data.innovation_category.split(',');
      }
      if (data.tech_category == '') {
        data.tech_category = [];
      } else if (data.tech_category) {
        data.tech_category = data.tech_category.split(',');
      }
      await this.projectBasicRepository.update(id, data);

      return {
        status: 200,
        message: 'Project updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async getAllProject(
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
      }
      if (data.search) {
        const searchProject = await this.projectBasicRepository.find({
          where: [
            { project_name: ILike(`%${data.search}%`) },
            { project_description: ILike(`%${data.search}%`) },
            { project_market: ILike(`%${data.search}%`) },
          ],
        });
        const projectIds = await this.arrayColumn(searchProject, 'id');
        whereConn.where.id = In(projectIds);
      }
      if (data.sort_by) {
        if (data.sort_by == PROJECT_SORT.TITLE_NAME) {
          whereConn.order = { project_name: 'ASC' };
        }
      }

      const project = await this.projectBasicRepository.find(whereConn);
      if (!project.length) {
        return {
          status: 500,
          message: 'No project found.',
        };
      }
      for (let i = 0; i < project.length; i++) {
        project[i].created_by = await this.getUser(project[i].created_by);
        if (project[i].product_category) {
          project[i].product_category = await this.getProjectCategoryById(
            project[i].product_category,
          );
        }
        if (project[i].goals) {
          project[i].goals = await this.getProjectGoalByIds(project[i].goals);
        }
        if (project[i].innovation_category) {
          project[i].innovation_category = await this.getBasicTypeByIds(
            project[i].innovation_category,
          );
        }
        if (project[i].tech_category) {
          project[i].tech_category = await this.getBasicTypeByIds(
            project[i].tech_category,
          );
        }
      }
      const total = await this.projectBasicRepository.count({
        where: { ...whereConn.where },
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: project,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async searchOpenProject(data: SearchDataDto): Promise<any> {
    try {
      const whereConn: any = {};
      if (data.search && data.search != '') {
        whereConn.where = {
          project_name: ILike(`%${data.search}%`),
          status: PROJECT_STATUS.ACTIVE,
        };
      } else {
        whereConn.where = {
          status: PROJECT_STATUS.ACTIVE,
        };
      }
      const project: any = await this.projectBasicRepository.find(whereConn);
      if (!project.length) {
        return {
          status: 500,
          message: 'No project found.',
        };
      }
      for (let i = 0; i < project.length; i++) {
        project[i].created_by = await this.getUser(project[i].created_by);
        if (project[i].product_category && project[i].product_category.length) {
          project[i].product_category = await this.getProjectCategoryById(
            project[i].product_category,
          );
        }
        if (project[i].goals && project[i].goals.length) {
          project[i].goals = await this.getProjectGoalByIds(project[i].goals);
        }
        if (
          project[i].innovation_category &&
          project[i].innovation_category.length
        ) {
          project[i].innovation_category = await this.getBasicTypeByIds(
            project[i].innovation_category,
          );
        }
        if (project[i].tech_category && project[i].tech_category.length) {
          project[i].tech_category = await this.getBasicTypeByIds(
            project[i].tech_category,
          );
        }
      }
      return project;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectById(id: number): Promise<any> {
    try {
      const project: any = await this.projectBasicRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!project) {
        return {
          status: 500,
          message: 'No project found.',
        };
      }
      project.created_by = await this.getUser(project.created_by);
      if (project.product_category) {
        project.product_category = await this.getProjectCategoryById(
          project.product_category,
        );
      }
      if (project.goals) {
        project.goals = await this.getProjectGoalByIds(project.goals);
      }
      if (project.innovation_category) {
        project.innovation_category = await this.getBasicTypeByIds(
          project.innovation_category,
        );
      }
      if (project.tech_category) {
        project.tech_category = await this.getBasicTypeByIds(
          project.tech_category,
        );
      }
      const member = await this.projectMemberRepository.count({
        where: {
          project_basic: { id: project.id },
        },
      });
      project.is_member = member != 0 ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE;
      return project;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteProject(id: number, user_id: number): Promise<any> {
    try {
      const where = user_id == 0 ? { id: id } : { id: id, created_by: user_id };
      const project = await this.projectBasicRepository.findOne({
        where: where,
      });
      if (!project) {
        return {
          status: 500,
          message: 'No project found.',
        };
      }
      await this.projectBasicRepository.delete(id);
      return {
        status: 200,
        message: 'Project deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createProjectAssessment(
    data: AssessmentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const project = await this.projectBasicRepository.findOne({
        where: {
          id: data.project_id,
        },
      });
      if (!project) {
        return {
          status: 500,
          message: 'Project not found.',
        };
      }
      const saveArr = [];
      for (let i = 0; i < data.faq.length; i++) {
        const projectAssessment = new ProjectAssessment();
        projectAssessment.created_by = user_id;
        projectAssessment.product_category = data.faq[i].product_category;
        projectAssessment.product_sub_category =
          data.faq[i].product_sub_category;
        projectAssessment.product_sub_faq = data.faq[i].product_sub_faq;
        projectAssessment.product_sub_faq_ans = data.faq[i].product_sub_faq_ans;
        projectAssessment.project_basic = project;
        saveArr.push(projectAssessment);
      }
      await this.projectAssessmentRepository.save(saveArr);
      return saveArr;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectAssessmentByProjectId(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const where: any =
        user_id == 0
          ? { project_basic: id }
          : { project_basic: id, created_by: user_id };
      const projectAssessment: any =
        await this.projectAssessmentRepository.find({
          where: where,
        });
      return projectAssessment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectAssessmentByCategoryId(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id == 0
          ? { product_category: id }
          : { product_category: id, created_by: user_id };
      const projectAssessment: any =
        await this.projectAssessmentRepository.find({
          where: where,
        });
      return projectAssessment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectAssessmentBySubCategoryId(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id == 0
          ? { product_sub_category: id }
          : { product_sub_category: id, created_by: user_id };
      const projectAssessment: any =
        await this.projectAssessmentRepository.find({
          where: where,
        });
      return projectAssessment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createProjectMember(
    data: ProjectMemberDto,
    user_id: number,
  ): Promise<any> {
    try {
      const project = await this.projectBasicRepository.findOne({
        where: {
          id: data.project_id,
        },
      });
      if (!project) {
        return {
          status: 500,
          message: 'Project not found.',
        };
      }
      const checkUser = await this.projectMemberRepository.find({
        where: {
          project_basic: {
            id: data.project_id,
          },
          user_id: In(data.user_id),
        },
      });
      if (checkUser.length) {
        return {
          return: 500,
          message: 'user already added to project',
        };
      }
      const saveArr = [];
      for (let i = 0; i < data.user_id.length; i++) {
        const projectMember = new ProjectMember();
        projectMember.project_basic = project;
        projectMember.created_by = user_id;
        projectMember.user_id = data.user_id[i];
        saveArr.push(projectMember);
        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_email', {
            email: data.user_id[i],
          }),
        );
        await this.projectMemberRepository.save(saveArr);
        const user = await this.getUser(user_id);
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'PROJECT_INVESTOR_INVITE',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace(
              '*user*',
              user & user.general_profile
                ? user.general_profile.first_name
                : '',
            )
            .replace('*project name*', project.project_name),
          content: admin_notification.notification_content
            .replace(
              '*user*',
              user & user.general_profile
                ? user.general_profile.first_name
                : '',
            )
            .replace('*project name*', project.project_name),
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
          template: 'PROJECT_INVESTOR_INVITE',
          payload: {
            emails: [invitedUser.email],
            data: {
              project_name: project.project_name,
              name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
              user_name: `${
                user & user.general_profile
                  ? user.general_profile.first_name
                  : ''
              } ${
                user & user.general_profile
                  ? user.general_profile.last_name
                  : ''
              }`,
              link: `${this.configService.get<string>(
                'project_investor_invite_url',
              )}/${projectMember.id}`,
            },
            subject: `You have been invited to a new project`,
          },
        };
        this.mailClient.emit('send_email', payload);
      }
      return saveArr;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectMemberByProjectId(id: number) {
    try {
      const member: any = await this.projectMemberRepository.find({
        where: {
          project_basic: {
            id: id,
          },
        },
      });
      for (let i = 0; i < member.length; i++) {
        member[i].user_id = await this.getUserByEmail(member[i].user_id);
      }
      return member;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectMemberById(id: number) {
    try {
      const member: any = await this.projectMemberRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!member) {
        return {
          status: 500,
          message: 'Project Member Not Found',
        };
      }
      member.user_id = await this.getUserByEmail(member.user_id);
      return member;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteProjectMember(id: number, user_id: number): Promise<any> {
    try {
      const where = user_id == 0 ? { id: id } : { id: id, created_by: user_id };
      const projectMember = await this.projectMemberRepository.findOne({
        where: where,
      });
      if (!projectMember) {
        return {
          status: 500,
          message: 'No project member found.',
        };
      }
      await this.projectMemberRepository.delete(id);
      return {
        status: 200,
        message: 'project member deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
