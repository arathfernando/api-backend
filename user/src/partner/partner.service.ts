import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  Partner,
  PartnerContactUs,
  PartnershipContact,
} from 'src/database/entities';
import { PARTNERSHIP_AREA, STATUS } from 'src/helper/constant';
import {
  UpdatePartnerDto,
  PaginationDto,
  GetBySlugDto,
  CreatePartnerContactUsDto,
} from 'src/helper/dtos';
import { S3Service } from 'src/helper/service/s3/s3.service';
import { AppService } from 'src/app.service';
import { ArrayContains, ILike, In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PartnerService {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    @Inject('PRODUCT_LAUNCHER')
    private readonly productLauncherClient: ClientProxy,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(PartnerContactUs)
    private readonly partnerContactUsRepository: Repository<PartnerContactUs>,
    @InjectRepository(PartnershipContact)
    private readonly partnershipContactRepository: Repository<PartnershipContact>,
    private readonly appService: AppService,
    private readonly s3Service: S3Service,
  ) {
    this.adminClient.connect();
    this.communityClient.connect();
  }

  public async createPartner(
    data: any,
    file: any,
    user_id: number,
  ): Promise<any> {
    try {
      let avatar;
      if (typeof file != 'string') {
        avatar = await this.s3Service.uploadFile(file);
        avatar = avatar.Location;
      } else {
        avatar = file;
      }
      const partner = new Partner();
      partner.partner_name = data.partner_name;
      partner.partner_image = avatar;
      partner.partner_link = data.partner_link;
      partner.partner_slug = await this.createSlug(data.partner_name);
      partner.partner_description = data.partner_description;
      partner.partner_type = data.partner_type;
      partner.community = data.community;
      partner.goals = data.goals;
      partner.partnership_activity = data.partnership_activity;
      partner.partnership_engagement = data.partnership_engagement;
      partner.partnership_goal = data.partnership_goal;
      partner.have_expertise = data.have_expertise;
      partner.expertise = data.expertise ? data.expertise.split(',') : null;
      partner.support_project = data.support_project;
      partner.projects = data.projects ? data.projects.split(',') : null;
      partner.have_contest = data.have_contest;
      partner.contest = data.contest ? data.contest.split(',') : null;
      partner.partnership_duration = data.partnership_duration;
      partner.partnership_start_date = data.partnership_start_date;
      partner.partnership_end_date = data.partnership_end_date;
      partner.language = data.language;
      partner.partnership_area = data.partnership_area;
      partner.status = data.status ? data.status : STATUS.INACTIVE;
      partner.created_by = data.created_by ? data.created_by : user_id;

      const partnerCreated = await this.partnerRepository.save(partner);

      if (data.contacts && data.contacts.length > 0) {
        const contacts = JSON.parse(data.contacts);
        for (let i = 0; i < contacts.length; i++) {
          const contact = new PartnershipContact();
          contact.has_hubbers_profile = contacts[i].has_hubbers_profile;
          contact.email = contacts[i].email;
          contact.user_id = contacts[i].user_id;
          contact.partner = partnerCreated;
          await this.partnershipContactRepository.save(contact);

          //TODO: send email to contact
        }
      }

      return partnerCreated;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async createSlug(text: string): Promise<string> {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  public async updatePartner(
    id: number,
    data: UpdatePartnerDto,
    file: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id == 0
          ? { id }
          : {
              id,
              created_by: user_id,
            };
      const partner = await this.partnerRepository.findOne({
        where,
        relations: ['contacts'],
      });

      if (!partner) {
        throw new HttpException('PARTNER_NOT_EXIST', HttpStatus.CONFLICT);
      }
      let avatar;
      if (file) {
        avatar = await this.s3Service.uploadFile(file);
        data.partner_image = avatar.Location;
      }

      if (data.contacts && data.contacts.length) {
        const contacts = JSON.parse(data.contacts);
        for (let i = 0; i < contacts.length; i++) {
          let existedContact;
          if (contacts[i].has_hubbers_profile == 'YES') {
            existedContact = partner.contacts.find(
              (item) => item.user_id == contacts[i].user_id,
            );
          } else {
            existedContact = partner.contacts.find(
              (item) => item.email === contacts[i].email,
            );
          }
          if (!existedContact) {
            const contact = new PartnershipContact();
            contact.has_hubbers_profile = contacts[i].has_hubbers_profile;
            contact.email = contacts[i].email;
            contact.user_id = contacts[i].user_id;
            contact.partner = partner;
            await this.partnershipContactRepository.save(contact);
            //TODO: send email to contact
          } else {
            const contact = await this.partnershipContactRepository.findOne({
              where: { id: existedContact.id },
            });
            delete contacts[i].id;

            await this.partnershipContactRepository.update(
              {
                id: contact.id,
              },
              contacts[i],
            );
          }
        }
        delete data.contacts;
      }
      const updateData: any = { ...data };
      if (updateData.expertise) {
        updateData.expertise = updateData.expertise.split(',');
      }
      if (updateData.projects) {
        updateData.projects = updateData.projects.split(',');
      }
      if (updateData.contest) {
        updateData.contest = updateData.contest.split(',');
      }
      await this.partnerRepository.update({ id: partner.id }, updateData);

      return {
        message: "Partner's information has been updated successfully",
      };
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async getPartners(data: PaginationDto, user_id: number): Promise<any> {
    try {
      const where =
        user_id == 0
          ? {}
          : {
              status: STATUS.ACTIVE,
            };
      const skip = data.limit * data.page - data.limit;

      const partners = await this.partnerRepository.find({
        where,
        relations: ['contacts'],
        order: {
          id: 'DESC',
        },
        take: data.limit,
        skip: skip,
      });

      const partnersRes: any = partners;

      if (partners.length > 0) {
        for (let i = 0; i < partnersRes.length; i++) {
          if (Number(partnersRes[i].partner_type) > 0) {
            const partner_type = await firstValueFrom(
              this.adminClient.send(
                'get_partner_type_by_id',
                Number(partnersRes[i].partner_type),
              ),
            );
            partnersRes[i].partner_type = partner_type;
          }

          const user = await this.appService.getUserById(
            Number(partnersRes[i].created_by),
          );

          partnersRes[i].created_by = user;
          const langRes = [];
          if (partnersRes[i].language) {
            const language = partnersRes[i].language.split(',');
            if (language.length != 0) {
              for (let j = 0; j < language.length; j++) {
                const interest = await firstValueFrom(
                  this.adminClient.send('get_language_by_id', {
                    id: language[j],
                  }),
                );
                langRes.push(interest);
              }
            }
          }

          partnersRes[i].language = langRes;

          if (partnersRes[i].goals) {
            const mainGoals = partnersRes[i].goals.split(',');
            const goals = [];
            for (let j = 0; j < mainGoals.length; j++) {
              const goal = await firstValueFrom(
                this.adminClient.send('get_goal_by_id', mainGoals[j]),
              );
              goals.push(goal);
            }

            partnersRes[i].goals = goals;
          }

          if (partnersRes[i].community) {
            const communities = [];
            const comm = partnersRes[i].community.split(',');
            for (let j = 0; j < comm.length; j++) {
              const communityRes = await firstValueFrom(
                this.communityClient.send('get_community_by_id', comm[j]),
              );
              communities.push(communityRes);
            }
            partnersRes[i].community = communities;
          }

          if (partners[i].contacts && partners[i].contacts.length > 0) {
            for (let j = 0; j < partners[i].contacts.length; j++) {
              const user = await this.appService.getUserById(
                Number(partners[i].contacts[j].user_id),
              );
              if (user) {
                partnersRes[i].contacts[j].user_id = user;
              }
            }
          }
          const expertRes = [];
          if (
            partnersRes[i].expertise &&
            partnersRes[i].expertise.length != 0
          ) {
            for (let j = 0; j < partnersRes[i].expertise.length; j++) {
              const expert = await firstValueFrom(
                this.productLauncherClient.send(
                  'get_gig_by_id',
                  JSON.stringify({
                    id: partnersRes[i].expertise[j],
                    user_id: user_id,
                  }),
                ),
              );
              expertRes.push(expert);
            }
          }

          partnersRes[i].expertise = expertRes;

          const projectRes = [];
          if (partnersRes[i].projects && partnersRes[i].projects.length != 0) {
            for (let j = 0; j < partnersRes[i].projects.length; j++) {
              const project = await firstValueFrom(
                this.productLauncherClient.send(
                  'get_project_by_id',
                  partnersRes[i].projects[j],
                ),
              );
              projectRes.push(project);
            }
          }
          partnersRes[i].projects = projectRes;
          const contestRes = [];
          if (partnersRes[i].contest && partnersRes[i].contest.length != 0) {
            for (let j = 0; j < partnersRes[i].contest.length; j++) {
              const contest = await firstValueFrom(
                this.communityClient.send(
                  'get_contest_by_id',
                  partnersRes[i].contest[j],
                ),
              );
              contestRes.push(contest);
            }
          }
          partnersRes[i].contest = contestRes;
        }
      }

      return partnersRes;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async getPartnersByLanguage(code: string): Promise<any> {
    try {
      const language = await firstValueFrom(
        this.adminClient.send('get_language_by_code', code),
      );
      if (!language) {
        return {
          status: 500,
          message: 'No language found.',
        };
      }
      const partners = await this.partnerRepository
        .createQueryBuilder('partner')
        .where(
          'partner.status = :status AND partner.partnership_area = :partnership_area AND (partner.language LIKE :language OR partner.language LIKE :language2 OR partner.language LIKE :language3 OR partner.language LIKE :language4)',
          {
            status: STATUS.ACTIVE,
            partnership_area: PARTNERSHIP_AREA.GLOBAL,
            language2: `${language.id},%`,
            language3: `%,${language.id}`,
            language4: `%,${language.id},%`,
            language: `${language.id}`,
          },
        )
        .leftJoinAndSelect('partner.contacts', 'contacts')
        .orderBy('partner.id', 'DESC')
        .getMany();

      const partnersRes: any = partners;

      if (partners.length > 0) {
        for (let i = 0; i < partnersRes.length; i++) {
          if (Number(partnersRes[i].partner_type) > 0) {
            const partner_type = await firstValueFrom(
              this.adminClient.send(
                'get_partner_type_by_id',
                Number(partnersRes[i].partner_type),
              ),
            );
            partnersRes[i].partner_type = partner_type;
          }
          const user = await this.appService.getUserById(
            Number(partnersRes[i].created_by),
          );
          partnersRes[i].created_by = user;
          const langRes = [];
          if (partnersRes[i].language) {
            const language = partnersRes[i].language.split(',');
            if (language.length != 0) {
              for (let j = 0; j < language.length; j++) {
                const interest = await firstValueFrom(
                  this.adminClient.send('get_language_by_id', {
                    id: language[j],
                  }),
                );
                langRes.push(interest);
              }
            }
            partnersRes[i].language = langRes;
          }

          if (partnersRes[i].goals) {
            const mainGoals = partnersRes[i].goals.split(',');
            const goals = [];
            for (let i = 0; i < mainGoals.length; i++) {
              const goal = await firstValueFrom(
                this.adminClient.send('get_goal_by_id', mainGoals[i]),
              );
              goals.push(goal);
            }

            partnersRes[i].goals = goals;
          }

          if (partnersRes[i].community) {
            const communities = [];
            const comm = partnersRes[i].community.split(',');
            for (let i = 0; i < comm.length; i++) {
              const communityRes = await firstValueFrom(
                this.communityClient.send('get_community_by_id', comm[i]),
              );
              communities.push(communityRes);
            }

            partnersRes[i].community = communities;
          }

          if (partners[i].contacts && partners[i].contacts.length > 0) {
            for (let j = 0; j < partners[i].contacts.length; j++) {
              const user = await this.appService.getUserById(
                Number(partners[i].contacts[j].user_id),
              );
              if (user) {
                partnersRes[i].contacts[j].user_id = user;
              }
            }
          }
          const projectRes = [];
          if (partnersRes[i].projects && partnersRes[i].projects.length != 0) {
            for (let j = 0; j < partnersRes[i].projects.length; j++) {
              const project = await firstValueFrom(
                this.productLauncherClient.send(
                  'get_project_by_id',
                  partnersRes[i].projects[j],
                ),
              );
              projectRes.push(project);
            }
          }
          partnersRes[i].projects = projectRes;
        }
      }

      return partnersRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPartnersByUserId(user_id: number): Promise<any> {
    try {
      const partners = await this.partnerRepository.find({
        where: {
          status: STATUS.ACTIVE,
          created_by: user_id,
        },
        relations: ['contacts'],
        order: {
          id: 'DESC',
        },
      });

      const partnersRes: any = partners;

      if (partners.length > 0) {
        for (let i = 0; i < partnersRes.length; i++) {
          if (Number(partnersRes[i].partner_type) > 0) {
            const partner_type = await firstValueFrom(
              this.adminClient.send(
                'get_partner_type_by_id',
                Number(partnersRes[i].partner_type),
              ),
            );
            partnersRes[i].partner_type = partner_type;
          }

          const langRes = [];
          if (partnersRes[i].language) {
            const language = partnersRes[i].language.split(',');
            if (language.length != 0) {
              for (let j = 0; j < language.length; j++) {
                const interest = await firstValueFrom(
                  this.adminClient.send('get_language_by_id', {
                    id: language[j],
                  }),
                );
                langRes.push(interest);
              }
            }
          }
          partnersRes[i].language = langRes;

          if (partnersRes[i].goals) {
            const mainGoals = partnersRes[i].goals.split(',');
            const goals = [];
            for (let i = 0; i < mainGoals.length; i++) {
              const goal = await firstValueFrom(
                this.adminClient.send('get_goal_by_id', mainGoals[i]),
              );
              goals.push(goal);
            }

            partnersRes[i].goals = goals;
          }

          if (partnersRes[i].community) {
            const communities = [];
            const comm = partnersRes[i].community.split(',');
            for (let i = 0; i < comm.length; i++) {
              const communityRes = await firstValueFrom(
                this.communityClient.send('get_community_by_id', comm[i]),
              );
              communities.push(communityRes);
            }

            partnersRes[i].community = communities;
          }

          if (partners[i].contacts && partners[i].contacts.length > 0) {
            for (let j = 0; j < partners[i].contacts.length; j++) {
              const user = await this.appService.getUserById(
                Number(partners[i].contacts[j].user_id),
              );

              if (user) {
                partnersRes[i].contacts[j].user_id = user;
              }
            }
          }
        }
      }

      return partnersRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunityPartners(id: number): Promise<any> {
    try {
      const partners = await this.partnerRepository.find({
        where: {
          community: String(id),
          status: STATUS.ACTIVE,
        },
        relations: ['contacts'],
      });

      const partnersRes: any = partners;
      if (partners.length > 0) {
        for (let i = 0; i < partnersRes.length; i++) {
          if (Number(partnersRes[i].partner_type) > 0) {
            const partner_type = await firstValueFrom(
              this.adminClient.send(
                'get_partner_type_by_id',
                Number(partnersRes[i].partner_type),
              ),
            );
            partnersRes[i].partner_type = partner_type;
          }

          const langRes = [];
          if (partnersRes[i].language) {
            const language = partnersRes[i].language.split(',');
            if (language.length != 0) {
              for (let j = 0; j < language.length; j++) {
                const interest = await firstValueFrom(
                  this.adminClient.send('get_language_by_id', {
                    id: language[j],
                  }),
                );
                langRes.push(interest);
              }
            }
          }
          partnersRes[i].language = langRes;

          if (partnersRes[i].goals) {
            const mainGoals = partnersRes[i].goals.split(',');
            const goals = [];
            for (let i = 0; i < mainGoals.length; i++) {
              const goal = await firstValueFrom(
                this.adminClient.send('get_goal_by_id', mainGoals[i]),
              );
              goals.push(goal);
            }

            partnersRes[i].goals = goals;
          }

          if (partnersRes[i].community) {
            const communities = [];
            const comm = partnersRes[i].community.split(',');
            for (let i = 0; i < comm.length; i++) {
              const communityRes = await firstValueFrom(
                this.communityClient.send('get_community_by_id', comm[i]),
              );
              communities.push(communityRes);
            }

            partnersRes[i].community = communities;
          }

          if (partners[i].contacts && partners[i].contacts.length > 0) {
            for (let j = 0; j < partners[i].contacts.length; j++) {
              const user = await this.appService.getUserById(
                Number(partners[i].contacts[j].user_id),
              );

              if (user) {
                partnersRes[i].contacts[j].user_id = user;
              }
            }
          }
        }
      }

      return partnersRes || [];
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async getContestPartners(id: number): Promise<any> {
    try {
      const partnersData = await this.partnerRepository
        .createQueryBuilder('partner')
        .where(`:id = ANY(partner.contest)`, { id })
        .getMany();
      const partnersId = await this.arrayColumn(partnersData, 'id');
      const partners = await this.partnerRepository.find({
        where: {
          id: In(partnersId),
        },
        relations: ['contacts'],
      });
      const partnersRes: any = partners;
      if (partners.length > 0) {
        for (let i = 0; i < partnersRes.length; i++) {
          if (Number(partnersRes[i].partner_type) > 0) {
            const partner_type = await firstValueFrom(
              this.adminClient.send(
                'get_partner_type_by_id',
                Number(partnersRes[i].partner_type),
              ),
            );
            partnersRes[i].partner_type = partner_type;
          }

          const langRes = [];
          if (partnersRes[i].language) {
            const language = partnersRes[i].language.split(',');
            if (language.length != 0) {
              for (let j = 0; j < language.length; j++) {
                const interest = await firstValueFrom(
                  this.adminClient.send('get_language_by_id', {
                    id: language[j],
                  }),
                );
                langRes.push(interest);
              }
            }
          }
          partnersRes[i].language = langRes;

          if (partnersRes[i].goals) {
            const mainGoals = partnersRes[i].goals.split(',');
            const goals = [];
            for (let i = 0; i < mainGoals.length; i++) {
              const goal = await firstValueFrom(
                this.adminClient.send('get_goal_by_id', mainGoals[i]),
              );
              goals.push(goal);
            }

            partnersRes[i].goals = goals;
          }

          if (partnersRes[i].community) {
            const communities = [];
            const comm = partnersRes[i].community.split(',');
            for (let i = 0; i < comm.length; i++) {
              const communityRes = await firstValueFrom(
                this.communityClient.send('get_community_by_id', comm[i]),
              );
              communities.push(communityRes);
            }

            partnersRes[i].community = communities;
          }

          if (partners[i].contacts && partners[i].contacts.length > 0) {
            for (let j = 0; j < partners[i].contacts.length; j++) {
              const user = await this.appService.getUserById(
                Number(partners[i].contacts[j].user_id),
              );

              if (user) {
                partnersRes[i].contacts[j].user_id = user;
              }
            }
          }
        }
      }

      return partnersRes || [];
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async getPartnerById(id: number): Promise<any> {
    try {
      const partner = await this.partnerRepository.find({
        where: {
          id: In([id]),
          status: Not(STATUS.CLOSED),
        },

        relations: ['contacts'],
      });
      if (!partner || partner.length == 0) {
        return {
          statusCode: 500,
          message: 'partner not found',
        };
      }
      const partnerRes: any = [...partner];

      if (partnerRes && partnerRes.length > 0) {
        for (let i = 0; i < partnerRes.length; i++) {
          if (Number(partnerRes[i].partner_type) > 0) {
            const partner_type = await firstValueFrom(
              this.adminClient.send(
                'get_partner_type_by_id',
                Number(partnerRes[i].partner_type),
              ),
            );
            partnerRes[i].partner_type = partner_type;
          }

          const langRes = [];
          if (partnerRes[i].language) {
            const language = partnerRes[i].language.split(',');
            if (language.length != 0) {
              for (let j = 0; j < language.length; j++) {
                const interest = await firstValueFrom(
                  this.adminClient.send('get_language_by_id', {
                    id: language[j],
                  }),
                );
                langRes.push(interest);
              }
            }
          }
          partnerRes[i].language = langRes;

          if (partnerRes[i].goals) {
            const mainGoals = partnerRes[i].goals.split(',');
            const goals = [];
            for (let i = 0; i < mainGoals.length; i++) {
              const goal = await firstValueFrom(
                this.adminClient.send('get_goal_by_id', mainGoals[i]),
              );
              goals.push(goal);
            }
            partnerRes[i].goals = goals;
          }

          if (partnerRes[i].community) {
            const communities = [];
            const comm = partnerRes[i].community.split(',');
            for (let i = 0; i < comm.length; i++) {
              const communityRes = await firstValueFrom(
                this.communityClient.send('get_community_by_id', comm[i]),
              );
              communities.push(communityRes);
            }
            partnerRes[i].community = communities;
          }

          if (partnerRes[i].contacts && partnerRes[i].contacts.length > 0) {
            for (let j = 0; j < partnerRes[i].contacts.length; j++) {
              const user = await this.appService.getUserById(
                Number(partnerRes[i].contacts[j].user_id),
              );

              if (user) {
                partnerRes[i].contacts[j].user_id = user;
              }
            }
          }
        }
      }

      return partnerRes;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async getPartnerByContestId(id: number): Promise<any> {
    try {
      const partner = await this.partnerRepository.find({
        where: {
          contest: ArrayContains([id]),
          status: Not(STATUS.CLOSED),
        },
        relations: ['contacts'],
      });

      if (!partner || partner.length == 0) {
        return {
          statusCode: 500,
          message: 'partner not found',
        };
      }

      const partnerRes: any = [...partner];

      if (partnerRes && partnerRes.length > 0) {
        for (let i = 0; i < partnerRes.length; i++) {
          if (Number(partnerRes[i].partner_type) > 0) {
            const partner_type = await firstValueFrom(
              this.adminClient.send(
                'get_partner_type_by_id',
                Number(partnerRes[i].partner_type),
              ),
            );
            partnerRes[i].partner_type = partner_type;
          }

          const langRes = [];
          if (partnerRes[i].language) {
            const language = partnerRes[i].language.split(',');
            if (language.length != 0) {
              for (let j = 0; j < language.length; j++) {
                const interest = await firstValueFrom(
                  this.adminClient.send('get_language_by_id', {
                    id: language[j],
                  }),
                );
                langRes.push(interest);
              }
            }
          }
          partnerRes[i].language = langRes;

          if (partnerRes[i].goals) {
            const mainGoals = partnerRes[i].goals.split(',');
            const goals = [];
            for (let i = 0; i < mainGoals.length; i++) {
              const goal = await firstValueFrom(
                this.adminClient.send('get_goal_by_id', mainGoals[i]),
              );
              goals.push(goal);
            }
            partnerRes[i].goals = goals;
          }

          if (partnerRes[i].community) {
            const communities = [];
            const comm = partnerRes[i].community.split(',');
            for (let i = 0; i < comm.length; i++) {
              const communityRes = await firstValueFrom(
                this.communityClient.send('get_community_by_id', comm[i]),
              );
              communities.push(communityRes);
            }
            partnerRes[i].community = communities;
          }

          if (partnerRes[i].contacts && partnerRes[i].contacts.length > 0) {
            for (let j = 0; j < partnerRes[i].contacts.length; j++) {
              const user = await this.appService.getUserById(
                Number(partnerRes[i].contacts[j].user_id),
              );

              if (user) {
                partnerRes[i].contacts[j].user_id = user;
              }
            }
          }
        }
      }

      return partnerRes;
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async searchPartnerName(name: string): Promise<any> {
    try {
      const partner = await this.partnerRepository.find({
        where: {
          partner_name: ILike(`%${name}%`),
        },
        relations: ['contacts'],
      });

      if (!partner || partner.length === 0) {
        throw new HttpException('PARTNER_NOT_EXIST', HttpStatus.CONFLICT);
      }

      return partner;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPartner(slug: GetBySlugDto, user_id: number): Promise<any> {
    try {
      const where =
        slug.slug && slug.slug != ''
          ? { partner_slug: ILike(`%${slug.slug}%`) }
          : { id: slug.id };

      const partner = await this.partnerRepository.findOne({
        where: where,
        relations: ['contacts'],
      });

      if (!partner) {
        throw new HttpException('PARTNER_NOT_EXIST', HttpStatus.CONFLICT);
      }

      const partnerRes: any = partner;
      if (Number(partnerRes.partner_type) > 0) {
        const partner_type = await firstValueFrom(
          this.adminClient.send(
            'get_partner_type_by_id',
            Number(partnerRes.partner_type),
          ),
        );
        partnerRes.partner_type = partner_type;
      }

      const langRes = [];
      if (partnerRes.language) {
        const language = partnerRes.language.split(',');
        if (language.length != 0) {
          for (let j = 0; j < language.length; j++) {
            const interest = await firstValueFrom(
              this.adminClient.send('get_language_by_id', {
                id: language[j],
              }),
            );
            langRes.push(interest);
          }
        }
      }
      partnerRes.language = langRes;

      if (partnerRes.goals) {
        const mainGoals = partnerRes.goals.split(',');
        const goals = [];
        for (let i = 0; i < mainGoals.length; i++) {
          const goal = await firstValueFrom(
            this.adminClient.send('get_goal_by_id', mainGoals[i]),
          );
          goals.push(goal);
        }
        partnerRes.goals = goals;
      }

      if (partnerRes.community) {
        const communities = [];
        const comm = partnerRes.community.split(',');
        for (let i = 0; i < comm.length; i++) {
          const communityRes = await firstValueFrom(
            this.communityClient.send('get_community_by_id', comm[i]),
          );
          communities.push(communityRes);
        }
        partnerRes.community = communities;
      }
      if (partnerRes.projects) {
        const project = [];
        for (let i = 0; i < partnerRes.projects.length; i++) {
          const projectRes = await firstValueFrom(
            this.productLauncherClient.send(
              'get_project_by_id',
              partnerRes.projects[i],
            ),
          );
          project.push(projectRes);
        }
        partnerRes.projects = project;
      }
      if (partnerRes.expertise) {
        const expertise = [];
        for (let i = 0; i < partnerRes.expertise.length; i++) {
          const expertiseRes = await firstValueFrom(
            this.productLauncherClient.send(
              'get_gig_by_id',
              JSON.stringify({
                id: partnerRes.expertise[i],
                user_id: user_id,
              }),
            ),
          );
          expertise.push(expertiseRes);
        }
        partnerRes.expertise = expertise;
      }

      if (partner.contacts && partner.contacts.length > 0) {
        for (let j = 0; j < partner.contacts.length; j++) {
          const user = await this.appService.getUserById(
            Number(partner.contacts[j].user_id),
          );

          if (user) {
            partnerRes.contacts[j].user_id = user;
          }
        }
      }

      return partnerRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deletePartner(id: number, user_id: number): Promise<any> {
    try {
      const where =
        user_id == 0
          ? { id }
          : {
              id,
              created_by: user_id,
            };
      const partner = await this.partnerRepository.findOne({
        where,
      });

      if (!partner) {
        throw new HttpException('PARTNER_NOT_EXIST', HttpStatus.CONFLICT);
      }

      await this.partnershipContactRepository.delete({
        partner: {
          id: partner.id,
        },
      });
      await this.partnerRepository.delete(id);

      return {
        message: "Partner's information has been deleted successfully",
      };
    } catch (error) {
      try {
        throw new RpcException(error);
      } catch {
        throw new InternalServerErrorException(error);
      }
    }
  }

  public async createPartnerContactUs(
    data: CreatePartnerContactUsDto,
  ): Promise<any> {
    try {
      const partner = await this.partnerRepository.findOne({
        where: {
          id: data.partner_id,
        },
      });
      if (!partner) {
        throw new HttpException('PARTNER_NOT_EXIST', HttpStatus.CONFLICT);
      }
      const contcat_us = new PartnerContactUs();
      contcat_us.email = data.email;
      contcat_us.subject = data.subject;
      contcat_us.message = data.message;
      contcat_us.first_name = data.first_name;
      contcat_us.last_name = data.last_name;
      contcat_us.partner = partner;
      await this.partnerContactUsRepository.save(contcat_us);
      return {
        message: 'Message sent successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updatePartnerContactUs(id: number, data: any): Promise<any> {
    try {
      const contact_us = await this.partnerContactUsRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!contact_us) {
        throw new HttpException(
          'PARTNER_CONTACT_US_NOT_EXIST',
          HttpStatus.CONFLICT,
        );
      }

      if (data.partner_id) {
        const partner = await this.partnerRepository.findOne({
          where: { id: data.partner_id },
        });
        if (!partner) {
          throw new HttpException('PARTNER_NOT_EXIST', HttpStatus.CONFLICT);
        }
        delete data.partner_id;
        data.partner = partner;
      }
      await this.partnerContactUsRepository.update(id, data);
      return {
        message: 'Information updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deletePartnerContactUs(id: number): Promise<any> {
    try {
      const contact_us = await this.partnerContactUsRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!contact_us) {
        throw new HttpException(
          'PARTNER_CONTACT_US_NOT_EXIST',
          HttpStatus.CONFLICT,
        );
      }
      await this.partnerContactUsRepository.delete({
        id: id,
      });
      return {
        message: 'Contact message deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPartnerContactUs(id: number): Promise<any> {
    try {
      const partner = await this.partnerRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!partner) {
        throw new HttpException('PARTNER_NOT_EXIST', HttpStatus.CONFLICT);
      }
      const contact_us = await this.partnerContactUsRepository.find({
        where: {
          partner: {
            id: partner.id,
          },
        },
      });

      return contact_us;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
