import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { POST_TYPE, POST_LOCATION } from 'src/core/constant/enum.constant';
import {
  Community,
  CommunityArticle,
  CommunityGroup,
  CommunityGroupTimeline,
  CommunityTimeline,
  CommunityTopic,
} from 'src/database/entities';
import { In, Repository } from 'typeorm';
import { CreateArticleDto } from '../core/dtos/community-article/create-community-article.dto';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommunityArticleService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
    @InjectRepository(CommunityArticle)
    private readonly communityArticleRepository: Repository<CommunityArticle>,
    @InjectRepository(CommunityGroup)
    private readonly communityGroupRepository: Repository<CommunityGroup>,
    @InjectRepository(CommunityGroupTimeline)
    private readonly groupTimelineRepository: Repository<CommunityGroupTimeline>,
    @InjectRepository(CommunityTimeline)
    private readonly timelineRepository: Repository<CommunityTimeline>,
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

  public async createArticle(
    data: CreateArticleDto,
    user_id: number,
  ): Promise<any> {
    try {
      let group = null;
      let community = null;

      if (data.post_location === POST_LOCATION.COMMUNITY) {
        community = await this.communityRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (!community) {
          throw new HttpException(
            'COMMUNITY_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      if (data.post_location === POST_LOCATION.GROUP) {
        group = await this.communityGroupRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (!group) {
          throw new HttpException(
            'GROUP_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      let topics = null;
      if (data.topics && data.topics != '') {
        const topicIds = data.topics.split(',');

        topics = await this.communityTopicRepository.find({
          where: {
            id: In(topicIds),
          },
        });
      }

      const post = new CommunityArticle();
      post.content = data.content;
      post.title = data.title;
      post.created_by = user_id;
      post.community = community;
      post.article_location = data.post_location;
      post.topics = topics;

      const postCreated = await this.communityArticleRepository.save(post);

      if (data.post_location === POST_LOCATION.COMMUNITY) {
        const timeline = new CommunityTimeline();
        timeline.community_id = community.id;
        timeline.created_by = user_id;
        timeline.post_id = postCreated.id;
        timeline.post_type = POST_TYPE.ARTICLE;

        await this.timelineRepository.save(timeline);
      }

      if (data.post_location === POST_LOCATION.GROUP) {
        const timeline = new CommunityGroupTimeline();
        timeline.group_id = group.id;
        timeline.created_by = user_id;
        timeline.post_id = postCreated.id;
        timeline.post_type = POST_TYPE.ARTICLE;

        await this.groupTimelineRepository.save(timeline);
      }

      return postCreated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateArticle(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id == null ? { id: id } : { id: id, created_by: user_id };
      const post = await this.communityArticleRepository.findOne({
        where: {
          ...where,
        },
      });

      if (!post) {
        return {
          status: 500,
          message: 'Article Not Found',
        };
      }

      if (data.topics && data.topics != '') {
        const topicIds = data.topics.split(',');

        const topics = await this.communityTopicRepository.find({
          where: {
            id: In(topicIds),
          },
        });
        post.topics = topics;
      }
      if (data.content) {
        post.content = data.content;
      }
      if (data.title) {
        post.title = data.title;
      }
      if (data.post_location) {
        post.article_location = data.post_location;
      }

      await this.communityArticleRepository.save(post);

      return {
        status: 200,
        message: 'Article updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getArticlesByCommunity(
    community_id: number,
    limit: number,
    page: number,
  ): Promise<any> {
    try {
      const skip = limit * page - limit;
      if (community_id) {
        const community = await this.communityRepository.findOne({
          where: {
            id: community_id,
          },
        });

        if (!community) {
          throw new HttpException(
            'COMMUNITY_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
      let where;
      if (community_id) {
        where = {
          community: {
            id: community_id,
          },
        };
      } else {
        where = {};
      }

      const article = await this.communityArticleRepository.find({
        where,
        relations: ['topics', 'comments', 'community'],
        order: {
          id: 'DESC',
        },
        take: limit,
        skip,
      });

      for (let i = 0; i < article.length; i++) {
        const user = await this.getUser(Number(article[i].created_by));
        article[i].created_by = user;
      }

      return article;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getArticlesByCommunityAdmin(
    id: number,
    data: any,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      let whereConn: any = `{}`;
      if (data.article_location != 'ALL') {
        whereConn = `{"article_location":"${data.article_location}"}`;
      }
      if (id && data.article_location != 'ALL') {
        whereConn = `{"${data.article_location.toLowerCase()}":{"id":${id}},"article_location":"${
          data.article_location
        }"}`;
      }
      whereConn = JSON.parse(whereConn);
      const post: any = await this.communityArticleRepository.find({
        where: whereConn,
        order: {
          id: 'DESC',
        },
        take: data.limit,
        skip,
        relations: ['topics', 'comments', 'community', 'group'],
      });
      for (let i = 0; i < post.length; i++) {
        const user = await this.getUser(Number(post[i].created_by));
        post[i].created_by = user;
      }
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getArticleById(id: number): Promise<any> {
    try {
      return await this.communityArticleRepository.findOne({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteArticle(id: number, user_id: number): Promise<any> {
    try {
      const where = user_id == 0 ? { id: id } : { id: id, created_by: user_id };
      const post = await this.communityArticleRepository.findOne({
        where: {
          ...where,
        },
      });

      if (!post) {
        return {
          status: 500,
          message: 'Article Not Found',
        };
      }
      const timeline = await this.timelineRepository.findOne({
        where: {
          post_id: id,
          created_by: user_id,
        },
      });
      if (timeline) {
        await this.timelineRepository.delete(timeline.id);
        await this.communityArticleRepository.delete(id);
      }
      await this.communityArticleRepository.delete(id);

      return {
        status: 200,
        message: 'Post deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
