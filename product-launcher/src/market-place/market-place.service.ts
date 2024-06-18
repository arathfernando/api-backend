import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import {
  GIG_REQUEST_RESPONSE_STATUS,
  GIG_REQUEST_STATUS,
  GIG_RESPONSE_STATUS,
  GIG_SORT_BY,
  GIG_STATUS,
  MARKET_FILTER,
  PRICING_CURRENCY,
  REVIEW_FILTER,
} from 'src/core/constant/enum.constant';
import { CreateFaqDto, PaginationDto } from 'src/core/dtos';
import { FilterRequestDataDto } from 'src/core/dtos/filter-request-data.dto';
import { CreateFeedbackDto } from 'src/core/dtos/market-place/create-feedback.dto';
import { FeedbackFilterDto } from 'src/core/dtos/market-place/feedback-filter.dto';
import { FilterDataDto } from 'src/core/dtos/market-place/filter.dto';
import { CreateReactionDto } from 'src/core/dtos/market-place/gig-reaction.dto';
import { CreateFeedbackReactionDto } from 'src/core/dtos/market-place/gig-feedback-reaction.dto';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  ProjectGig,
  ProjectGigFaq,
  ProjectGigFeedback,
  ProjectGigGallery,
  ProjectGigPackage,
} from 'src/database/entities';
import { ProjectGigFeedbackReaction } from 'src/database/entities/feedback-reaction.entity';
import { ProjectGigCategory } from 'src/database/entities/gig-category.entity';
import { ProjectGigReaction } from 'src/database/entities/gig-reaction.entity';
import { ProjectGigRequestResponse } from 'src/database/entities/gig-request-response.entity';
import { ProjectGigRequest } from 'src/database/entities/gig-request.entity';
import { ILike, In, Repository } from 'typeorm';
import { CreateGigPaymentDto } from 'src/core/dtos/market-place/gig-payment.dto';
import { GigPayment } from 'src/database/entities/gig-payment.entity';
import { PackageAllProcessDto } from 'src/core/dtos/market-place/package-all-process-dto';
import { FaqAllProcessDto } from 'src/core/dtos/market-place/faq-all-process-dto';
import { GigFilterDataDto } from 'src/core/dtos/market-place/gig-filter.dto';
import { GigCategoryFilterDataDto } from 'src/core/dtos/market-place/gig-category-filter.dto';
import { createGigReportDto } from 'src/core/dtos/market-place/gig-report.dto';
import { GigReport } from 'src/database/entities/gig-report.entity';

@Injectable()
export class MarketPlaceService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('PRODUCT_LAUNCHER')
    private readonly marketPlaceClient: ClientProxy,
    @Inject('TRANSACTION_SERVICE')
    private readonly transactionClient: ClientProxy,
    @InjectRepository(ProjectGig)
    private readonly gigRepository: Repository<ProjectGig>,
    @InjectRepository(ProjectGigPackage)
    private readonly gigPackageRepository: Repository<ProjectGigPackage>,
    @InjectRepository(ProjectGigFaq)
    private readonly gigFaqRepository: Repository<ProjectGigFaq>,
    @InjectRepository(ProjectGigGallery)
    private readonly gigGalleryRepository: Repository<ProjectGigGallery>,
    @InjectRepository(ProjectGigFeedback)
    private readonly projectGigFeedbackRepository: Repository<ProjectGigFeedback>,
    @InjectRepository(ProjectGigRequest)
    private readonly projectGigRequestRepository: Repository<ProjectGigRequest>,
    @InjectRepository(ProjectGigRequestResponse)
    private readonly projectGigRequestResponse: Repository<ProjectGigRequestResponse>,
    @InjectRepository(ProjectGigCategory)
    private readonly gigCategoryRepository: Repository<ProjectGigCategory>,
    @InjectRepository(ProjectGigReaction)
    private readonly gigReactionRepository: Repository<ProjectGigReaction>,
    @InjectRepository(GigPayment)
    private readonly gigPaymentRepository: Repository<GigPayment>,
    @InjectRepository(ProjectGigFeedbackReaction)
    private readonly projectGigFeedbackReactionRepository: Repository<ProjectGigFeedbackReaction>,
    @InjectRepository(GigReport)
    private readonly gigReportRepository: Repository<GigReport>,
    private readonly s3Service: S3Service,
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

  public async createGigCategory(data: any, user_id: number): Promise<any> {
    try {
      const category = new ProjectGigCategory();
      category.name = data.name;
      category.description = data.description;
      category.created_by = user_id;
      category.cover = data.cover;
      return this.gigCategoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigCategory(id: number, data: any): Promise<any> {
    try {
      const gigCategory = await this.gigCategoryRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!gigCategory) {
        return {
          status: 500,
          message: 'No Gig Category Found',
        };
      }
      await this.gigCategoryRepository.update(id, data);

      return {
        status: 200,
        message: 'Gig Category updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigCategoryById(id: number): Promise<any> {
    try {
      const gigCategory = await this.gigCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!gigCategory) {
        return {
          status: 500,
          message: 'No Gig Category Found',
        };
      }

      return gigCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigAllCategory(): Promise<any> {
    try {
      const gigCategory = await this.gigCategoryRepository.find();
      for (let i = 0; i < gigCategory.length; i++) {
        const user = await this.getUser(Number(gigCategory[i].created_by));
        gigCategory[i].created_by = user;
      }
      if (!gigCategory) {
        return {
          status: 500,
          message: 'No Gig Category Found',
        };
      }

      return gigCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteGigCategory(id: number): Promise<any> {
    try {
      const gig = await this.gigCategoryRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!gig) {
        return {
          status: 500,
          message: 'No Gig Category Found',
        };
      }

      await this.gigCategoryRepository.delete(id);

      return {
        status: 200,
        message: 'Gig Category deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createGig(data: any, user_id: number): Promise<any> {
    try {
      const categories = await this.gigCategoryRepository.findByIds(
        data.categories,
      );
      if (categories.length !== data.categories.length) {
        throw new BadRequestException('One or more categories are invalid');
      }
      const gig = new ProjectGig();
      gig.expertise_title = data.expertise_title;
      gig.slug = await this.createSlug(data.expertise_title);
      gig.description = data.description;
      gig.categories = categories;
      gig.tags = data.tags;
      gig.created_by = user_id;
      gig.gig_status = data.gig_status ? data.gig_status : GIG_STATUS.PENDING;
      gig.workspace_id = data.workspace_id ? data.workspace_id : null;
      gig.product_category = data.product_category
        ? data.product_category
        : null;
      gig.product_sub_category = data.product_sub_category
        ? data.product_sub_category
        : null;
      gig.product_sub_faq = data.product_sub_faq ? data.product_sub_faq : null;

      return this.gigRepository.save(gig);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGig(
    id: number,
    updateData: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id === 0 ? { id: id } : { id: id, created_by: user_id };
      const gig = await this.gigRepository.findOne({
        where: where,
        relations: ['categories'], // add relation to eager load categories
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      if (updateData.categories) {
        const categories = await this.gigCategoryRepository.findByIds(
          updateData.categories,
        );
        gig.categories = categories; // update categories relation on the gig entity
        delete updateData.categories;
      }

      Object.assign(gig, updateData); // merge updateData into gig entity

      await this.gigRepository.save(gig);

      return {
        status: HttpStatus.OK,
        message: 'Gig updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllGigs(pagination: PaginationDto): Promise<any> {
    try {
      const skip = (pagination.page - 1) * pagination.limit;

      const gigs = await this.gigRepository.find({
        relations: ['packages', 'faqs', 'gallery_images', 'categories'],
        order: {
          id: 'DESC',
        },
        take: pagination.limit,
        skip: skip,
      });

      const total = await this.gigRepository.count();
      const totalPages = Math.ceil(total / pagination.limit);

      if (gigs.length == 0) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }
      for (let i = 0; i < gigs.length; i++) {
        gigs[i].created_by = await this.getUser(gigs[i].created_by);

        if (gigs[i].workspace_id) {
          const workspace = await firstValueFrom(
            this.marketPlaceClient.send<any>(
              'get_workspace_by_workspace_id',
              gigs[i].workspace_id,
            ),
          );
          gigs[i].workspace_id = workspace;
        }

        if (gigs[i].product_category) {
          const productCategory = await firstValueFrom(
            this.adminClient.send<any>(
              'get_product_category_by_id',
              gigs[i].product_category,
            ),
          );
          gigs[i].product_category = productCategory;
        }

        if (gigs[i].product_sub_category) {
          const productSubCategory = await firstValueFrom(
            this.adminClient.send<any>(
              'get_sub_category_by_id',
              gigs[i].product_sub_category,
            ),
          );
          gigs[i].product_sub_category = productSubCategory;
        }

        if (gigs[i].product_sub_faq) {
          const productSubCategoryFaq = await firstValueFrom(
            this.adminClient.send<any>(
              'get_sub_category_faq_by_id',
              gigs[i].product_sub_faq,
            ),
          );
          gigs[i].product_sub_faq = productSubCategoryFaq;
        }
      }
      return {
        data: gigs,
        page: pagination.page,
        limit: pagination.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllGigsFilter(
    data: GigFilterDataDto,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = (data.page - 1) * data.limit;
      const whereCon: any = {
        where: {},
        take: data.limit,
        skip: skip,
        relations: [
          'packages',
          'faqs',
          'gallery_images',
          'categories',
          'feedbacks',
        ],
      };
      const sortMap = {
        [GIG_SORT_BY.DATE_ASCENDING]: { id: 'ASC' },
        [GIG_SORT_BY.DATE_DESCENDING]: { id: 'DESC' },
        [GIG_SORT_BY.PRICE_ASCENDING]: { id: 'ASC' },
        [GIG_SORT_BY.PRICE_DESCENDING]: { id: 'DESC' },
        [GIG_SORT_BY.TITLE_ASCENDING]: { expertise_title: 'ASC' },
        [GIG_SORT_BY.TITLE_DESCENDING]: { expertise_title: 'DESC' },
      };

      if (sortMap[data.sort_by]) {
        whereCon.order = sortMap[data.sort_by];
      }

      if (data.filter == 'ALL') {
        let request_id = [];
        let user_request_id = [];
        const request = await this.projectGigRequestRepository.find({
          where: {
            created_by: user_id,
            request_response_status: GIG_REQUEST_STATUS.ACCEPTED,
          },
          relations: ['gig'],
        });
        if (request.length) {
          request_id = await this.arrayColumn(request, 'gig');
          request_id = await this.arrayColumn(request_id, 'id');
        }
        const userRequest = await this.gigRepository.find({
          where: {
            created_by: user_id,
          },
        });
        if (userRequest.length) {
          user_request_id = await this.arrayColumn(userRequest, 'id');
        }
        const requestIds = request_id.concat(user_request_id);
        whereCon.where.id = In(requestIds);
      }

      if (data.filter == 'MY_EXPERTISE' && user_id != 0) {
        whereCon.where.created_by = user_id;
      }

      if (data.filter == 'BOUGHT_EXPERTISE' && user_id != 0) {
        const request = await this.projectGigRequestRepository
          .query(`SELECT gig_id FROM project_gig_request 
          WHERE request_response_status = '${GIG_REQUEST_RESPONSE_STATUS.ACCEPTED}' AND created_by = '${user_id}'`);
        const gigIds = request.map((r) => r.gig_id);
        whereCon.where.id = In(gigIds);
      }

      if (data.search) {
        whereCon.where.expertise_title = ILike(`%${data.search}%`);
      }
      const gigs: any = await this.gigRepository.find(whereCon);

      if (gigs.length == 0) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }
      for (let i = 0; i < gigs.length; i++) {
        let allRating = 0;
        gigs[i].created_by = await this.getUser(gigs[i].created_by);
        if (gigs[i].workspace_id) {
          const workspace = await firstValueFrom(
            this.marketPlaceClient.send<any>(
              'get_workspace_by_workspace_id',
              gigs[i].workspace_id,
            ),
          );
          gigs[i].workspace_id = workspace;
        }

        if (gigs[i].product_category) {
          const productCategory = await firstValueFrom(
            this.adminClient.send<any>(
              'get_product_category_by_id',
              gigs[i].product_category,
            ),
          );
          gigs[i].product_category = productCategory;
        }

        if (gigs[i].product_sub_category) {
          const productSubCategory = await firstValueFrom(
            this.adminClient.send<any>(
              'get_sub_category_by_id',
              gigs[i].product_sub_category,
            ),
          );
          gigs[i].product_sub_category = productSubCategory;
        }

        if (gigs[i].product_sub_faq) {
          const productSubCategoryFaq = await firstValueFrom(
            this.adminClient.send<any>(
              'get_sub_category_faq_by_id',
              gigs[i].product_sub_faq,
            ),
          );
          gigs[i].product_sub_faq = productSubCategoryFaq;
        }

        gigs[i].created_by = gigs[i].created_by;
        const currentUserReaction = await this.gigReactionRepository.findOne({
          where: {
            created_by: user_id,
            gig: { id: gigs[i].id },
          },
          order: {
            id: 'DESC',
          },
        });
        gigs[i].current_user_reaction = currentUserReaction;
        const reviewCount = await this.projectGigFeedbackRepository.count({
          where: {
            gig: { id: gigs[i].id },
          },
        });
        for (let j = 0; j < gigs[i].feedbacks.length; j++) {
          allRating =
            allRating + parseInt(gigs[i].feedbacks[j].over_all_rating);
        }

        gigs[i].review_count =
          allRating / reviewCount ? allRating / reviewCount : 0;

        const reviewer = await this.projectGigFeedbackRepository
          .query(`SELECT created_by , COUNT(created_by) as total
        FROM project_gig_feedback
        WHERE gig_id = ${gigs[i].id}
        GROUP BY created_by
        ORDER BY total DESC
        `);
        gigs[i].reviewer_count = reviewer.length;
      }
      const total = await this.gigRepository.count(whereCon);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: gigs,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllCategoryFilter(data: GigCategoryFilterDataDto): Promise<any> {
    try {
      const skip = (data.page - 1) * data.limit;
      const whereConn: any = {
        where: {},
        order: {
          id: 'DESC',
        },
        take: data.limit,
        skip: skip,
      };
      if (data.search) {
        whereConn.where.name = ILike(`%${data.search}%`);
      }
      const gigCategory = await this.gigCategoryRepository.find(whereConn);

      if (!gigCategory) {
        return {
          status: 500,
          message: 'No Gig Category Found',
        };
      }
      const total = await this.gigCategoryRepository.count({
        where: { ...whereConn.where },
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: gigCategory,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigById(id: number, user_id: number): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          id: id,
        },
        relations: [
          'packages',
          'faqs',
          'gallery_images',
          'categories',
          'request',
          'feedbacks',
        ],
      });
      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }
      const gigRes: any = gig;

      if (gigRes.created_by) {
        gigRes.created_by = await this.getUser(gigRes.created_by);
      }
      const resTags: any = [];
      if (gigRes.tags) {
        const tags = gigRes.tags;
        const interest = await firstValueFrom(
          this.adminClient.send('get_basic_type_ids', JSON.stringify(tags)),
        );
        resTags.push(interest);
      }
      gigRes.tags = resTags;
      const currentUserReaction = await this.gigReactionRepository.findOne({
        where: {
          created_by: user_id,
          gig: { id: id },
        },
        order: { id: 'DESC' },
      });
      gigRes.current_user_reaction = currentUserReaction
        ? currentUserReaction
        : {};
      const currentUserRequest = await this.projectGigRequestRepository.findOne(
        {
          where: {
            created_by: user_id,
            gig: { id: id },
          },
          order: { id: 'DESC' },
          relations: ['gig_package'],
        },
      );
      gigRes.current_user_package =
        currentUserRequest && currentUserRequest.gig_package
          ? currentUserRequest.gig_package
          : {};
      if (currentUserRequest && currentUserRequest.gig_package) {
        delete currentUserRequest.gig_package;
      }
      gigRes.current_user_request = currentUserRequest
        ? currentUserRequest
        : {};

      let allRating = 0;
      const reviewCount = await this.projectGigFeedbackRepository.count({
        where: {
          gig: { id: gigRes.id },
        },
      });

      for (let i = 0; i < gigRes.feedbacks.length; i++) {
        allRating = allRating + parseInt(gigRes.feedbacks[i].over_all_rating);
      }

      gigRes.review_count =
        allRating / reviewCount ? allRating / reviewCount : 0;

      const reviewer = await this.projectGigFeedbackRepository
        .query(`SELECT created_by , COUNT(created_by) as total
        FROM project_gig_feedback
        WHERE gig_id = ${gigRes.id}
        GROUP BY created_by
        ORDER BY total DESC
        `);
      gigRes.reviewer_count = reviewer.length;
      return gigRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigBySlug(slug: string): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          slug: ILike(`%${slug}`),
        },
        relations: ['packages', 'faqs', 'gallery_images', 'categories'],
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      return gig;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigsByCategory(category: number): Promise<any> {
    try {
      const queryBuilder: any = await this.gigRepository.query(
        `SELECT gig_id from gig_with_category WHERE category_id = ${category}`,
      );
      if (!queryBuilder.length) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }
      const gig_ids = await this.arrayColumn(queryBuilder, 'gig_id');
      const response = await this.gigRepository.find({
        where: {
          id: In(gig_ids),
        },
      });
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigsByTag(tag: number): Promise<any> {
    try {
      const queryBuilder = this.gigRepository.createQueryBuilder('gig');
      queryBuilder
        .where('gig.tags @> ARRAY[:tag]::integer[]', { tag: tag })
        .leftJoinAndSelect('gig.packages', 'package')
        .leftJoinAndSelect('gig.faqs', 'faq')
        .leftJoinAndSelect('gig.gallery_images', 'gallery_image')
        .leftJoinAndSelect('gig.categories', 'category');

      const gigs = await queryBuilder.getMany();

      if (!gigs) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      return gigs;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  async getGigsBySearch(data: FilterDataDto, user_id: number): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const newD = {
        take: data.limit,
        skip,
      };
      const whereCon: any = {
        where: {},
        take: newD.take,
        skip: newD.skip,
        relations: [
          'packages',
          'faqs',
          'gallery_images',
          'categories',
          'feedbacks',
        ],
      };
      if (data.category_id) {
        const gigs = await this.getGigsByCategory(data.category_id);
        if (gigs.status === 500) {
          return gigs;
        }
        const gigsId = await this.arrayColumn(gigs, 'id');
        whereCon.where.id = In(gigsId);
      }
      const sortMap = {
        [GIG_SORT_BY.DATE_ASCENDING]: { id: 'ASC' },
        [GIG_SORT_BY.DATE_DESCENDING]: { id: 'DESC' },
        [GIG_SORT_BY.PRICE_ASCENDING]: { id: 'ASC' },
        [GIG_SORT_BY.PRICE_DESCENDING]: { id: 'DESC' },
        [GIG_SORT_BY.TITLE_ASCENDING]: { expertise_title: 'ASC' },
        [GIG_SORT_BY.TITLE_DESCENDING]: { expertise_title: 'DESC' },
      };

      whereCon.order = sortMap[data.sort_by] || {};

      if (data.market_filter == MARKET_FILTER.JUST_ADDED) {
        whereCon.orderBy = {
          id: 'DESC',
        };
      }

      if (data.market_filter == MARKET_FILTER.MOST_POPULAR) {
        const feedBack = await this.projectGigFeedbackRepository
          .query(`SELECT gig_id , COUNT(gig_id) as total
        FROM project_gig_feedback
        GROUP BY gig_id 
        ORDER BY total DESC
        `);
        const gig_id = await this.arrayColumn(feedBack, 'gig_id');
        whereCon.where.id = In(gig_id);
      }

      if (data.market_filter == MARKET_FILTER.TRENDING) {
        const feedBack = await this.projectGigFeedbackRepository
          .query(`SELECT gig_id , COUNT(gig_id) as total
        FROM project_gig_feedback
        GROUP BY gig_id 
        ORDER BY total DESC
        `);
        const gig_id = await this.arrayColumn(feedBack, 'gig_id');
        whereCon.where.id = In(gig_id);
      }

      if (data.market_filter == MARKET_FILTER.MY_EXPERTISE && user_id != 0) {
        whereCon.where.created_by = user_id;
      }

      if (
        data.market_filter == MARKET_FILTER.BOUGHT_EXPERTISE &&
        user_id != 0
      ) {
        const request = await this.projectGigRequestRepository
          .query(`SELECT gig_id FROM project_gig_request 
          WHERE request_response_status = '${GIG_REQUEST_RESPONSE_STATUS.ACCEPTED}' AND created_by = '${user_id}'`);
        const gigIds = request.map((r) => r.gig_id);
        whereCon.where.id = In(gigIds);
      }

      if (data.market_filter == MARKET_FILTER.SAVED_EXPERTISE && user_id != 0) {
        const feedBack = await this.projectGigFeedbackRepository
          .query(`SELECT gig_id , COUNT(gig_id) as total
        FROM project_gig_feedback
        WHERE created_by = '${user_id}'
        GROUP BY gig_id 
        ORDER BY total DESC
        `);
        const gig_id = await this.arrayColumn(feedBack, 'gig_id');
        whereCon.where.id = In(gig_id);
      }
      if (data.search) {
        whereCon.where.expertise_title = ILike(`%${data.search}%`);
      }
      const gigs: any = await this.gigRepository.find(whereCon);
      if (!gigs) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }
      for (let i = 0; i < gigs.length; i++) {
        let allRating = 0;
        gigs[i].created_by = await this.getUser(gigs[i].created_by);
        const currentUserReaction = await this.gigReactionRepository.findOne({
          where: {
            created_by: user_id,
            gig: { id: gigs[i].id },
          },
          order: {
            id: 'DESC',
          },
        });
        gigs[i].current_user_reaction = currentUserReaction;
        const reviewCount = await this.projectGigFeedbackRepository.count({
          where: {
            gig: { id: gigs[i].id },
          },
        });
        for (let j = 0; j < gigs[i].feedbacks.length; j++) {
          allRating =
            allRating + parseInt(gigs[i].feedbacks[j].over_all_rating);
        }

        gigs[i].review_count =
          allRating / reviewCount ? allRating / reviewCount : 0;

        const reviewer = await this.projectGigFeedbackRepository
          .query(`SELECT created_by , COUNT(created_by) as total
        FROM project_gig_feedback
        WHERE gig_id = ${gigs[i].id}
        GROUP BY created_by
        ORDER BY total DESC
        `);
        gigs[i].reviewer_count = reviewer.length;
      }
      const total = await this.gigRepository.count(whereCon);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: gigs,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteGig(id: number, user_id: number): Promise<any> {
    try {
      const where =
        user_id === 0 ? { id: id } : { id: id, created_by: user_id };
      const gig = await this.gigRepository.findOne({
        where: where,
      });
      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      await this.gigRepository.delete(id);

      return {
        status: 200,
        message: 'Gig deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createPackage(data: any, user_id: number): Promise<any> {
    try {
      const gigPackageResp: any = [];
      for (let i = 0; i < data.length; i++) {
        const where: any =
          user_id === 0
            ? { id: data[i].gig_id }
            : { id: data[i].gig_id, created_by: user_id };
        const gig = await this.gigRepository.findOne({
          where: {
            ...where,
          },
        });

        if (!gig) {
          return {
            status: 500,
            message: 'No gig found.',
          };
        }

        const gigPackage = new ProjectGigPackage();
        gigPackage.gig = gig;
        gigPackage.package_title = data[i].package_title;
        gigPackage.description = data[i].description;
        gigPackage.package_price = data[i].package_price;
        gigPackage.how_get_paid = data[i].how_get_paid;
        gigPackage.available_from = data[i].available_from;
        gigPackage.available_to = data[i].available_to;
        gigPackage.created_by = user_id;

        await this.gigPackageRepository.save(gigPackage);
        gigPackageResp.push(gigPackage);
      }
      return gigPackageResp;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigPackage(data: any, user_id: number): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const where: any =
          user_id === 0
            ? { id: data[i].gig_id }
            : { id: data[i].gig_id, created_by: user_id };
        const gig = await this.gigRepository.findOne({
          where: { ...where },
        });

        if (!gig) {
          return {
            status: 500,
            message: 'No gig found.',
          };
        }
        const whereCon =
          user_id === 0
            ? { id: data[i].id, gig: data[i].gig_id }
            : {
                id: data[i].id,
                gig: data[i].gig_id,
                created_by: user_id,
              };
        const gigPackage = await this.gigPackageRepository.findOne({
          where: whereCon,
        });

        if (!gigPackage) {
          return {
            status: 500,
            message: 'No gig package found.',
          };
        }
        data[i].gig_id = gig;
        delete data[i].gig_id;

        await this.gigPackageRepository.update(data[i].id, data[i]);
      }
      const ids = await this.arrayColumn(data, 'id');
      const responseData = await this.gigPackageRepository.find({
        where: {
          id: In(ids),
        },
      });
      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigPackageByGigId(id: number): Promise<any> {
    try {
      const gig_package = await this.gigPackageRepository.find({
        where: {
          gig: { id: id },
        },
      });

      if (!gig_package) {
        return {
          status: 500,
          message: 'No gig package found.',
        };
      }

      return gig_package;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deletePackage(id: number, user_id: number): Promise<any> {
    try {
      const where =
        user_id === 0 ? { id: id } : { id: id, created_by: user_id };
      const gigPackage = await this.gigPackageRepository.findOne({
        where: where,
      });

      if (!gigPackage) {
        return {
          status: 500,
          message: 'No gig package found.',
        };
      }

      await this.gigPackageRepository.delete(id);

      return {
        status: 200,
        message: 'Package deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createFaq(data: CreateFaqDto[], user_id: number): Promise<any> {
    try {
      const gigFaqResp: any = [];
      for (let i = 0; i < data.length; i++) {
        const where: any =
          user_id === 0
            ? { id: data[i].gig_id }
            : { id: data[i].gig_id, created_by: user_id };
        const gig = await this.gigRepository.findOne({
          where: {
            ...where,
          },
        });

        if (!gig) {
          return {
            status: 500,
            message: 'No gig found.',
          };
        }
        const gigFaq = new ProjectGigFaq();
        gigFaq.gig = gig;
        gigFaq.question = data[i].question;
        gigFaq.answer = data[i].answer;
        gigFaq.created_by = user_id;

        await this.gigFaqRepository.save(gigFaq);
        gigFaqResp.push(gigFaq);
      }

      return gigFaqResp;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigFaq(data: any, user_id: number): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const where: any =
          user_id === 0
            ? { id: data[i].gig_id }
            : { id: data[i].gig_id, created_by: user_id };
        const gig = await this.gigRepository.findOne({
          where: { ...where },
        });

        if (!gig) {
          return {
            status: 500,
            message: 'No gig found.',
          };
        }
        const wheres =
          user_id === 0
            ? { id: data[i].id, gig: data[i].gig_id }
            : { id: data[i].id, gig: data[i].gig_id, created_by: user_id };
        const gigFaq = await this.gigFaqRepository.findOne({
          where: wheres,
        });

        if (!gigFaq) {
          return {
            status: 500,
            message: 'No gig faq found.',
          };
        }
        data[i].gig_id = gig;
        delete data[i].gig_id;
        await this.gigFaqRepository.update(data[i].id, data[i]);
      }
      const ids = await this.arrayColumn(data, 'id');
      const responseData = await this.gigFaqRepository.find({
        where: {
          id: In(ids),
        },
      });
      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigFaqByGigId(id: number): Promise<any> {
    try {
      const gigFaq = await this.gigFaqRepository.find({
        where: {
          gig: { id: id },
        },
      });

      if (!gigFaq.length) {
        return {
          status: 500,
          message: 'No gig faq found.',
        };
      }

      return gigFaq;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteFaq(id: number, user_id: number): Promise<any> {
    try {
      const where =
        user_id === 0 ? { id: id } : { id: id, created_by: user_id };
      const gigFaq = await this.gigFaqRepository.findOne({
        where: where,
      });

      if (!gigFaq) {
        return {
          status: 500,
          message: 'No gig faq found.',
        };
      }

      await this.gigFaqRepository.delete(id);

      return {
        status: 200,
        message: 'FAQ deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createFeedback(
    data: CreateFeedbackDto,
    user_id: number,
  ): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          id: data.gig_id,
        },
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      const gigFaq = new ProjectGigFeedback();
      gigFaq.gig = gig;
      gigFaq.message = data.message;
      gigFaq.title = data.title;
      gigFaq.delivery_rating = data.delivery_rating;
      gigFaq.expertise_content_rating = data.expertise_content_rating;
      gigFaq.over_all_rating = data.over_all_rating;
      gigFaq.results_rating = data.results_rating;
      gigFaq.created_by = user_id;

      await this.projectGigFeedbackRepository.save(gigFaq);

      return {
        status: 200,
        message: 'Feedback added successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigFeedback(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          id: data.gig_id,
        },
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }
      const gigFeedback = await this.projectGigFeedbackRepository.findOne({
        where: {
          id: id,
          gig: { id: data.gig_id },
          created_by: user_id,
        },
      });

      if (!gigFeedback) {
        return {
          status: 500,
          message: 'No gig feedback found.',
        };
      }
      data.gig_id = gig;
      delete data.gig_id;
      await this.projectGigFeedbackRepository.update(id, data);

      return {
        status: 200,
        message: 'Feedback updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigFeedbackByGigId(id: number): Promise<any> {
    try {
      const gigFeedback = await this.projectGigFeedbackRepository.find({
        where: {
          gig: { id },
        },
      });

      if (!gigFeedback) {
        return {
          status: 500,
          message: 'No gig feedback found.',
        };
      }

      return gigFeedback;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigFeedback(data: FeedbackFilterDto, user_id: number): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const newD = {
        take: data.limit,
        skip,
      };
      const whereConn: any = {
        where: {
          gig: { id: data.gig_id },
        },
        take: newD.take,
        skip: newD.skip,
      };
      if (data.filter == REVIEW_FILTER.MOST_RELEVANT) {
        const feedCount = await this.projectGigFeedbackRepository
          .query(`SELECT feedback_id , COUNT(feedback_id) as total
FROM project_gig_feedback_reaction
GROUP BY feedback_id 
ORDER BY total DESC
`);
        const feedIds = await this.arrayColumn(feedCount, 'feedback_id');
        whereConn.where.id = In(feedIds);
      }
      if (data.filter == REVIEW_FILTER.MOST_RECENT) {
        whereConn.order = { id: 'DESC' };
      }
      const gigFeedback: any =
        await this.projectGigFeedbackRepository.find(whereConn);

      if (!gigFeedback) {
        return {
          status: 500,
          message: 'No gig feedback found.',
        };
      }
      let allRating = 0;
      // let allRating = 0;
      const reviewCount = await this.projectGigFeedbackRepository.count({
        where: {
          gig: {
            id: data.gig_id,
          },
        },
      });
      for (let i = 0; i < gigFeedback.length; i++) {
        gigFeedback[i].created_by = await this.getUser(
          gigFeedback[i].created_by,
        );
        allRating = allRating + parseInt(gigFeedback[i].over_all_rating);
      }

      const reviewer = await this.projectGigFeedbackRepository
        .query(`SELECT created_by , COUNT(created_by) as total
      FROM project_gig_feedback
      WHERE gig_id = ${data.gig_id}
      GROUP BY created_by
      ORDER BY total DESC
      `);

      const individual = await this.projectGigFeedbackRepository
        .query(`SELECT over_all_rating , COUNT(over_all_rating) as total
      FROM project_gig_feedback
      WHERE gig_id = ${data.gig_id}
      GROUP BY over_all_rating
      ORDER BY total DESC
      `);
      for (let i = 0; i < gigFeedback.length; i++) {
        const currentUserReaction =
          await this.projectGigFeedbackReactionRepository.findOne({
            where: {
              feedback: { id: gigFeedback[i].id },
              created_by: user_id,
            },
            order: {
              id: 'DESC',
            },
          });
        gigFeedback[i].current_user_reaction = currentUserReaction;
      }
      const total = await this.projectGigFeedbackRepository.count(whereConn);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: gigFeedback,
        review_count: allRating / reviewCount ? allRating / reviewCount : 0,
        reviewer_count: reviewer.length,
        individual: individual,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPopularExpertise(): Promise<any> {
    try {
      const gigCount = await this.projectGigFeedbackRepository
        .query(`SELECT gig_id , COUNT(gig_id) as total
FROM project_gig_feedback
GROUP BY gig_id 
ORDER BY total DESC
`);
      const gigIds = await this.arrayColumn(gigCount, 'gig_id');
      const responseGig = await this.gigRepository.find({
        where: {
          id: In(gigIds),
        },
        relations: ['packages', 'faqs', 'gallery_images', 'feedbacks'],
      });
      for (let i = 0; i < responseGig.length; i++) {
        responseGig[i].created_by = await this.getUser(
          responseGig[i].created_by,
        );
      }
      return responseGig;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getExpertiseByUserId(user_id: number): Promise<any> {
    try {
      const responseGig: any = await this.gigRepository.find({
        where: {
          created_by: user_id,
          gig_status: GIG_STATUS.PUBLISHED,
        },
        relations: ['packages', 'faqs', 'gallery_images', 'feedbacks'],
      });
      for (let i = 0; i < responseGig.length; i++) {
        let allRating = 0;
        const currentUserReaction = await this.gigReactionRepository.findOne({
          where: {
            created_by: user_id,
            gig: { id: responseGig[i].id },
          },
          order: {
            id: 'DESC',
          },
        });
        responseGig[i].current_user_reaction = currentUserReaction;
        const user = await this.getUser(Number(responseGig[i].created_by));
        responseGig[i].created_by = user;
        const reviewCount = await this.projectGigFeedbackRepository.count({
          where: {
            gig: { id: responseGig[i].id },
          },
        });
        for (let j = 0; j < responseGig[i].feedbacks.length; j++) {
          allRating =
            allRating + parseInt(responseGig[i].feedbacks[j].over_all_rating);
        }

        responseGig[i].review_count =
          allRating / reviewCount ? allRating / reviewCount : 0;

        const reviewer = await this.projectGigFeedbackRepository
          .query(`SELECT created_by , COUNT(created_by) as total
        FROM project_gig_feedback
        WHERE gig_id = ${responseGig[i].id}
        GROUP BY created_by
        ORDER BY total DESC
        `);
        responseGig[i].reviewer_count = reviewer.length;
      }
      return responseGig;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllFeedback(data: any): Promise<any> {
    try {
      const feedBack = await this.projectGigFeedbackRepository.find({
        order: {
          id: 'DESC',
        },
        relations: ['gig'],
        take: data.take,
        skip: data.skip,
      });
      if (!feedBack.length) {
        return {
          status: 500,
          message: 'No Feedback found.',
        };
      }
      for (let i = 0; i < feedBack.length; i++) {
        feedBack[i].created_by = await this.getUser(feedBack[i].created_by);
        feedBack[i].gig.created_by = await this.getUser(
          feedBack[i].gig.created_by,
        );
      }
      return feedBack;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteFeedback(id: number, user_id: number): Promise<any> {
    try {
      const where: any = user_id === 0 ? { id } : { id, created_by: user_id };
      const gigFaq = await this.projectGigFeedbackRepository.findOne({
        where: { ...where },
      });

      if (!gigFaq) {
        return {
          status: 500,
          message: 'No gig feedback found.',
        };
      }

      await this.projectGigFeedbackRepository.delete(id);

      return {
        status: 200,
        message: 'FAQ deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createGigGallery(
    gig_id: number,
    data: any,
    image: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where: any =
        user_id === 0 ? { id: gig_id } : { id: gig_id, created_by: user_id };
      const gig = await this.gigRepository.findOne({
        where: {
          ...where,
        },
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      let gallery_image;
      if (image && typeof image != 'string') {
        gallery_image = await this.s3Service.uploadFile(image);
        gallery_image = gallery_image.Location;
      } else {
        gallery_image = image;
      }

      const gigGallery = new ProjectGigGallery();
      gigGallery.gig = gig;
      gigGallery.image_url = gallery_image;
      gigGallery.image_title = data.image_title;
      gigGallery.image_description = data.image_description;
      gigGallery.created_by = user_id;

      return await this.gigGalleryRepository.save(gigGallery);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigGallery(
    gig_id: number,
    id: number,
    data: any,
    image: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id === 0 ? { id: gig_id } : { id: gig_id, created_by: user_id };
      const gig = await this.gigRepository.findOne({
        where: where,
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }
      const wheres =
        user_id === 0
          ? { id, gig: { id: gig_id } }
          : { id, gig: { id: gig_id }, created_by: user_id };

      const gigGallery = await this.gigGalleryRepository.findOne({
        where: wheres,
      });

      if (!gigGallery) {
        return {
          status: 500,
          message: 'No gig gallery found.',
        };
      }

      let gallery_image: any;

      if (image) {
        gallery_image = await this.s3Service.uploadFile(image);
        data.image_url = gallery_image.Location;
      }

      await this.gigGalleryRepository.update(id, data);

      return data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigGalleryByGigId(id: number): Promise<any> {
    try {
      const gigGallery = await this.gigGalleryRepository.find({
        where: {
          gig: { id: id },
        },
      });

      if (!gigGallery.length) {
        return {
          status: 500,
          message: 'No gig gallery found.',
        };
      }

      return gigGallery;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteGallery(id: number, user_id: number): Promise<any> {
    try {
      const where: any =
        user_id === 0 ? { id: id } : { id: id, created_by: user_id };
      const gigGallery = await this.gigGalleryRepository.findOne({
        where: {
          ...where,
        },
      });

      if (!gigGallery) {
        return {
          status: 500,
          message: 'No gig gallery found.',
        };
      }

      await this.gigGalleryRepository.delete(id);

      return {
        status: 200,
        message: 'Gallery Image deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPopularCategory(): Promise<any> {
    try {
      const result = await this.gigCategoryRepository
        .createQueryBuilder('gig_with_category')
        .select('gig_with_category.id', 'gwc_category_id')
        .addSelect('COUNT(*)', 'countCat')
        .groupBy('gig_with_category.id')
        .getRawMany();
      result.sort((a, b) => b.countCat - a.countCat);
      const cat_ids = result.map((row) => row.gwc_category_id);
      const gigCategory = await this.gigCategoryRepository.find({
        where: {
          id: In(cat_ids),
        },
      });
      return gigCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createSlug(text: string): Promise<string> {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  public async createGigRequest(
    gig_id: number,
    data: any,
    image: any,
    user_id: number,
  ): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          id: gig_id,
        },
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      const gigRequest = new ProjectGigRequest();
      if (data.gig_package_id) {
        const gigPackage = await this.gigPackageRepository.findOne({
          where: {
            id: data.gig_package_id,
          },
        });

        if (!gig) {
          return {
            status: 500,
            message: 'Gig package not found.',
          };
        }
        gigRequest.gig_package = gigPackage;
      }

      let gallery_image;
      if (image && typeof image != 'string') {
        gallery_image = await this.s3Service.uploadFile(image);
        gallery_image = gallery_image.Location;
      } else {
        gallery_image = image;
      }

      gigRequest.gig = gig;
      gigRequest.attachment = gallery_image;
      gigRequest.description = data.description;
      gigRequest.budget_for_service = data.budget_for_service;
      gigRequest.status = data.status;
      gigRequest.state = data.state;
      gigRequest.request_response_status = data.request_response_status;
      gigRequest.created_by = user_id;

      return await this.projectGigRequestRepository.save(gigRequest);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigRequest(
    gig_id: number,
    id: number,
    data: any,
    image: any,
  ): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: { id: gig_id },
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      const gigRequest = await this.projectGigRequestRepository.findOne({
        where: { id: id, gig: { id: gig_id } },
      });

      if (!gigRequest) {
        return {
          status: 500,
          message: 'Request not found',
        };
      }

      let gallery_image: any;

      if (image && typeof image != 'string') {
        gallery_image = await this.s3Service.uploadFile(image);
        data.attachment = gallery_image.Location;
      } else {
        data.attachment = image;
      }

      const gigPackage = await this.gigPackageRepository.findOne({
        where: { id: data.gig_package_id },
      });
      delete data.gig_package_id;
      data.gig_package = gigPackage;

      await this.projectGigRequestRepository.update(id, data);

      return {
        status: 200,
        message: 'Request updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigRequestByGigId(id: number): Promise<any> {
    try {
      const gigRequest = await this.projectGigRequestRepository.findOne({
        where: {
          gig: { id: id },
        },
      });

      if (!gigRequest) {
        return {
          status: 500,
          message: 'Request not found.',
        };
      }

      return gigRequest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigRequestByStatus(
    id: number,
    data: FilterRequestDataDto,
  ): Promise<any> {
    try {
      const where: any = {
        gig: { id: id },
      };
      if (data.search) {
        const userData = await this.projectGigRequestRepository.query(
          `SELECT * from general_profile WHERE LOWER(first_name) LIKE LOWER('%${data.search}%') OR LOWER(last_name) LIKE LOWER('%${data.search}%')`,
        );
        const userIds = await this.arrayColumn(userData, 'user_id');
        where.created_by = In(userIds);
      }
      if (data.state) {
        where.state = data.state;
      }
      if (data.status) {
        where.status = data.status;
      }
      if (data.request_response_status) {
        where.request_response_status = data.request_response_status;
      }
      const gigRequest: any = await this.projectGigRequestRepository.find({
        where: where,
        relations: ['gig_package', 'request_response'],
      });

      if (gigRequest && gigRequest.length) {
        for (let i = 0; i < gigRequest.length; i++) {
          const user = await this.getUser(Number(gigRequest[i].created_by));
          gigRequest[i].created_by = user;
        }
      }
      return gigRequest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteRequest(id: number, user_id: number): Promise<any> {
    try {
      const where: any =
        user_id === 0 ? { id: id } : { id: id, created_by: user_id };
      const gigRequest = await this.projectGigRequestRepository.findOne({
        where: {
          ...where,
        },
      });

      if (!gigRequest) {
        return {
          status: 500,
          message: 'Request not found.',
        };
      }

      await this.projectGigRequestRepository.delete(id);

      return {
        status: 200,
        message: 'request deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createGigRequestResponse(
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const gigReq = await this.projectGigRequestRepository.findOne({
        where: { id: data.request_id },
      });

      if (!gigReq) {
        return {
          status: 500,
          message: 'Request not found',
        };
      }

      const gigRequest = new ProjectGigRequestResponse();
      gigRequest.request = gigReq;
      gigRequest.attachments = data.attachments;
      gigRequest.message = data.message;
      gigRequest.reply_with_message = data.reply_with_message
        ? data.reply_with_message
        : '';
      gigRequest.response_status = data.response_status
        ? data.response_status
        : GIG_RESPONSE_STATUS.PENDING;
      gigRequest.link_attached = data.link_attached;
      gigRequest.created_by = user_id;

      return await this.projectGigRequestResponse.save(gigRequest);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigRequestResponse(id: number, data: any): Promise<any> {
    try {
      const gigReqRes = await this.projectGigRequestResponse.findOne({
        where: {
          id: id,
        },
      });
      if (!gigReqRes) {
        return {
          status: 500,
          message: 'Request response not found',
        };
      }
      if (data.request_id) {
        const gigReq = await this.projectGigRequestRepository.findOne({
          where: { id: data.request_id },
        });

        if (!gigReq) {
          return {
            status: 500,
            message: 'Request not found',
          };
        }
        delete data.request_id;
        data.request = gigReq;
      }

      await this.projectGigRequestResponse.update(id, data);

      return {
        status: 200,
        message: 'Request response updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigRequestResponseByReqId(
    id: number,
    response_status: GIG_RESPONSE_STATUS,
  ): Promise<any> {
    try {
      const gigRequest = await this.projectGigRequestResponse.find({
        where: {
          request: {
            id: id,
          },
          response_status: response_status,
        },
      });

      if (!gigRequest.length) {
        return {
          status: 500,
          message: 'Request response not found.',
        };
      }

      return gigRequest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigRequestResponseByGigId(
    id: number,
    response_status: GIG_RESPONSE_STATUS,
  ): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          id: id,
        },
        relations: ['request'],
      });
      if (!gig.request.length) {
        return {
          status: 500,
          message: 'No Request found for this gig.',
        };
      }
      const reqId = await this.arrayColumn(gig.request, 'id');

      const gigRequest = await this.projectGigRequestResponse.find({
        where: {
          request: {
            id: In(reqId),
          },
          response_status: response_status,
        },
        relations: ['request'],
      });

      if (!gigRequest.length) {
        return {
          status: 500,
          message: 'Request response not found.',
        };
      }
      for (let i = 0; i < gigRequest.length; i++) {
        gigRequest[i].created_by = await this.getUser(gigRequest[i].created_by);
      }
      return gigRequest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteRequestResponse(id: number): Promise<any> {
    try {
      const gigRequest = await this.projectGigRequestResponse.findOne({
        where: { id: id },
      });

      if (!gigRequest) {
        return {
          status: 500,
          message: 'Request response not found.',
        };
      }

      await this.projectGigRequestResponse.delete(id);

      return {
        status: 200,
        message: 'request response deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createReaction(
    data: CreateReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          id: data.gig_id,
        },
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      const gigReaction = new ProjectGigReaction();
      gigReaction.gig = gig;
      gigReaction.created_by = user_id;
      gigReaction.reaction = data.reaction;

      await this.gigReactionRepository.save(gigReaction);

      return {
        status: 200,
        message: 'Reaction added successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigReaction(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          created_by: user_id,
          id: data.gig_id,
        },
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }

      const gigReaction = await this.gigReactionRepository.findOne({
        where: {
          id: id,
          gig: { id: data.gig_id },
          created_by: user_id,
        },
      });

      if (!gigReaction) {
        return {
          status: 500,
          message: 'No gig reaction found.',
        };
      }
      data.gig = gig;
      delete data.gig_id;
      await this.gigReactionRepository.update(id, data);

      return {
        status: 200,
        message: 'Reaction updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGigReactionByGigId(id: number): Promise<any> {
    try {
      const gigReaction = await this.gigReactionRepository.find({
        where: {
          gig: { id },
        },
      });

      if (!gigReaction) {
        return {
          status: 500,
          message: 'No gig reaction found.',
        };
      }

      return gigReaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteReaction(id: number, user_id: number): Promise<any> {
    try {
      const gigReaction = await this.gigReactionRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });

      if (!gigReaction) {
        return {
          status: 500,
          message: 'No gig reaction found.',
        };
      }

      await this.gigReactionRepository.delete(id);

      return {
        status: 200,
        message: 'Reaction deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async createFeedbackReaction(
    data: CreateFeedbackReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const gig = await this.projectGigFeedbackRepository.findOne({
        where: {
          id: data.feedback_id,
        },
      });

      if (!gig) {
        return {
          status: 500,
          message: 'No feedback found.',
        };
      }

      const gigReaction = new ProjectGigFeedbackReaction();
      gigReaction.feedback = gig;
      gigReaction.created_by = user_id;
      gigReaction.is_helpful = data.is_helpful;

      await this.projectGigFeedbackReactionRepository.save(gigReaction);

      return {
        status: 200,
        message: 'Reaction added successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateFeedbackReaction(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const feedback = await this.projectGigFeedbackRepository.findOne({
        where: {
          created_by: user_id,
          id: data.feedback_id,
        },
      });

      if (!feedback) {
        return {
          status: 500,
          message: 'No feed back found',
        };
      }

      const feedbackReaction =
        await this.projectGigFeedbackReactionRepository.findOne({
          where: {
            id: id,
            feedback: { id: data.feedback_id },
            created_by: user_id,
          },
        });

      if (!feedbackReaction) {
        return {
          status: 500,
          message: 'No feedback reaction found.',
        };
      }
      data.feedback = feedback;
      delete data.feedback_id;
      await this.projectGigFeedbackReactionRepository.update(id, data);

      return {
        status: 200,
        message: 'Reaction updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getReactionByFeedbackId(id: number): Promise<any> {
    try {
      const gigReaction = await this.projectGigFeedbackReactionRepository.find({
        where: {
          feedback: { id: id },
        },
      });

      if (!gigReaction) {
        return {
          status: 500,
          message: 'No gig feedback found.',
        };
      }

      return gigReaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteFeedbackReaction(
    id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const gigReaction =
        await this.projectGigFeedbackReactionRepository.findOne({
          where: {
            id: id,
            created_by: user_id,
          },
        });

      if (!gigReaction) {
        return {
          status: 500,
          message: 'No feedback reaction found.',
        };
      }

      await this.projectGigFeedbackReactionRepository.delete(id);

      return {
        status: 200,
        message: 'Reaction deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createGigPayment(
    data: CreateGigPaymentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const gig = await this.gigRepository.findOne({
        where: {
          id: data.gig_id,
        },
      });
      if (!gig) {
        return {
          status: 500,
          message: 'No gig found.',
        };
      }
      const gig_package = await this.gigPackageRepository.findOne({
        where: {
          gig: {
            id: gig.id,
          },
          id: data.gig_package_id,
        },
      });
      if (data.pricing_currency == PRICING_CURRENCY.HBB_TOKEN) {
        const user = await this.getUser(user_id);
        if (
          user.general_profile.hbb_points != '' &&
          user.general_profile.hbb_points < data.pricing
        ) {
          return {
            status: 500,
            message: 'Not enough HBB Token found for payment.',
          };
        } else {
          const updateData = {
            id: user.general_profile.id,
            hbb_points: user.general_profile.hbb_points - data.pricing,
          };
          await firstValueFrom(
            this.userClient.send<any>(
              'update_general_profile',
              JSON.stringify(updateData),
            ),
          );
        }
      }
      const gigPayment = new GigPayment();
      gigPayment.project_gig = gig;
      gigPayment.project_gig_package = gig_package;
      gigPayment.installment = data.installment;
      gigPayment.created_by = user_id;
      gigPayment.pricing_currency = data.pricing_currency;
      gigPayment.pricing = data.pricing;
      gigPayment.pricing_type = data.pricing_type;
      await this.gigPaymentRepository.save(gigPayment);
      const createTransaction = {
        transaction_from_type:
          data.pricing_currency == PRICING_CURRENCY.HBB_TOKEN
            ? 'HBB'
            : 'CURRENCY',
        transaction_to_type:
          data.pricing_currency == PRICING_CURRENCY.HBB_TOKEN
            ? 'HBB'
            : 'CURRENCY',
        transaction_amount: data.pricing,
        area: 0,
        transaction_from: user_id,
        transaction_to: data.gig_id,
        operation_type: 'BUY',
        transaction_for_type: 'GIG',
        user_id: user_id,
      };
      await firstValueFrom(
        this.transactionClient.send<any>(
          'create_admin_transaction',
          JSON.stringify(createTransaction),
        ),
      );
      return gigPayment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async gigPackageAllProcess(
    data: PackageAllProcessDto,
    user_id: number,
  ): Promise<any> {
    try {
      const responseReturn = {
        create_package: [],
        update_package: [],
      };
      if (data.create_package && data.create_package.length) {
        const response = await this.createPackage(data.create_package, user_id);
        if (response.status === 500) {
          return response;
        }
        responseReturn.create_package.push(response);
      }
      if (data.update_package && data.update_package.length) {
        const response = await this.updateGigPackage(
          data.update_package,
          user_id,
        );
        if (response.status === 500) {
          return response;
        }
        responseReturn.update_package.push(response);
      }
      if (data.delete_package) {
        for (let i = 0; i < data.delete_package.length; i++) {
          const response = await this.deletePackage(
            data.delete_package[i],
            user_id,
          );
          if (response.status === 500) {
            return response;
          }
        }
      }
      return responseReturn;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async gigFaqAllProcess(
    data: FaqAllProcessDto,
    user_id: number,
  ): Promise<any> {
    try {
      const responseReturn = {
        create_faq: [],
        update_faq: [],
      };
      if (data.create_faq && data.create_faq.length) {
        const response = await this.createFaq(data.create_faq, user_id);
        if (response.status === 500) {
          return response;
        }
        responseReturn.create_faq.push(response);
      }
      if (data.update_faq && data.update_faq.length) {
        const response = await this.updateGigFaq(data.update_faq, user_id);
        if (response.status === 500) {
          return response;
        }
        responseReturn.update_faq.push(response);
      }
      if (data.delete_faq) {
        for (let i = 0; i < data.delete_faq.length; i++) {
          const response = await this.deleteFaq(data.delete_faq[i], user_id);
          if (response.status === 500) {
            return response;
          }
        }
      }

      return responseReturn;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createGigReport(
    data: createGigReportDto,
    user_id: number,
  ): Promise<any> {
    try {
      const gigReport = new GigReport();
      gigReport.gig_id = data.gig_id;
      gigReport.report_type = data.report_type;
      gigReport.content_url = data.content_url;
      gigReport.description = data.description;
      gigReport.proof_of_your_copyright = data.proof_of_your_copyright;
      gigReport.created_by = user_id;
      await this.gigReportRepository.save(gigReport);
      return gigReport;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigReport(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const gigReport = await this.gigReportRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });
      if (!gigReport) {
        return {
          status: 500,
          message: 'No gig report found.',
        };
      }
      await this.gigReportRepository.update(id, data);
      return {
        status: 200,
        message: 'gig report update successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigReport(id: number): Promise<any> {
    try {
      const gigReport = await this.gigReportRepository.findOne({
        where: { id: id },
      });
      if (!gigReport) {
        return {
          status: 500,
          message: 'gig report not found.',
        };
      }
      return gigReport;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteGigReport(id: number): Promise<any> {
    try {
      const gigReport = await this.gigReportRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!gigReport) {
        return {
          status: 500,
          message: 'gig report not found.',
        };
      }
      await this.gigReportRepository.delete(id);
      return {
        status: 200,
        message: 'gig report deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
