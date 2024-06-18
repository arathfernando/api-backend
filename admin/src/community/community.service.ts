import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCommunityDto, PaginationDto } from 'src/helper/dtos';
import { CreateArticleDto } from 'src/helper/dtos/create-community-article.dto';
import { CreatePostDto } from 'src/helper/dtos/create-post.dto';
import { InviteUsersToCommunityDto } from 'src/helper/dtos/invite-users.dto';
import { PostFilterDto } from 'src/helper/dtos/post-filter.dto';
import { UpdateUsersToCommunityDto } from 'src/helper/dtos/update-invite-users.dto';
import { S3Service } from 'src/helper/services/s3/s3.service';

@Injectable()
export class CommunityService {
  constructor(
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) {
    this.communityClient.connect();
  }

  async createCommunity(logo: any, data: CreateCommunityDto): Promise<any> {
    try {
      let avatar;

      if (logo) {
        avatar = await this.s3Service.uploadFile(logo);
      }

      const communityDto: any = data;
      communityDto.avatar = avatar.Location;

      const createdRes = await firstValueFrom(
        this.communityClient.send('add_community', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCommunity(logo: any, data: any, id: number): Promise<any> {
    try {
      let avatar;

      if (logo) {
        avatar = await this.s3Service.uploadFile(logo);
      }

      data.id = id;
      if (avatar) {
        data.avatar = avatar.Location;
      }
      data.community_created_by = data.created_by;
      delete data.created_by;

      await firstValueFrom(
        this.communityClient.send('update_community', JSON.stringify(data)),
      );

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllCommunities(limit: number, page_no: number): Promise<any> {
    try {
      const skip = limit * page_no - limit;

      const communities = await firstValueFrom(
        this.communityClient.send(
          'get_all_communities',
          JSON.stringify({
            take: limit,
            skip,
          }),
        ),
      );

      return communities;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunity(id: number): Promise<any> {
    try {
      const community = await firstValueFrom(
        this.communityClient.send('get_community_by_id', id),
      );

      return community;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async inviteUsers(data: InviteUsersToCommunityDto): Promise<any> {
    try {
      const communityMembers = await firstValueFrom(
        this.communityClient.send(
          'invite_community_members',
          JSON.stringify(data),
        ),
      );

      return communityMembers;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCommunityMember(
    data: UpdateUsersToCommunityDto,
    id: number,
  ): Promise<any> {
    try {
      const new_data: any = data;
      new_data.id = id;

      const communityMember = await firstValueFrom(
        this.communityClient.send(
          'update_community_member',
          JSON.stringify(new_data),
        ),
      );

      return communityMember;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunityMembersById(
    id: number,
    data: PaginationDto,
  ): Promise<any> {
    try {
      const newD = {
        id: id,
        data: data,
      };
      const communityMembers = await firstValueFrom(
        this.communityClient.send(
          'get_members_by_community',
          JSON.stringify(newD),
        ),
      );

      return communityMembers;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCommunity(id: number): Promise<any> {
    try {
      await firstValueFrom(this.communityClient.send('delete_community', id));

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createPost(
    files: Express.Multer.File[],
    data: CreatePostDto,
  ): Promise<any> {
    try {
      if (files) {
        const fileUrls = [];
        await Promise.all(
          files.map(async (file) => {
            const f = await this.s3Service.uploadFile(file);
            fileUrls.push(f.Location);
          }),
        );
        data.attachments = fileUrls;
      }

      const createdRes = await firstValueFrom(
        this.communityClient.send('add_community_post', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updatePost(
    files: Express.Multer.File[],
    data: any,
    id: number,
  ): Promise<any> {
    try {
      if (files) {
        const fileUrls = [];
        await Promise.all(
          files.map(async (file) => {
            const f = await this.s3Service.uploadFile(file);
            fileUrls.push(f.Location);
          }),
        );
        data.attachments = fileUrls;
      }
      data.id = id;
      const communityPost = await firstValueFrom(
        this.communityClient.send(
          'update_community_post',
          JSON.stringify(data),
        ),
      );

      return communityPost;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getPostByCommunity(
    id: number,
    status: PostFilterDto,
  ): Promise<any> {
    try {
      const new_data: any = status;
      new_data.id = id;
      const communityPost = await firstValueFrom(
        this.communityClient.send(
          'get_community_post_by_community_id',
          JSON.stringify(new_data),
        ),
      );

      return communityPost;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPostById(id: number): Promise<any> {
    try {
      const communityPost = await firstValueFrom(
        this.communityClient.send('get_community_post_by_id', id),
      );

      return communityPost;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deletePost(id: number): Promise<any> {
    try {
      const communityPost = await firstValueFrom(
        this.communityClient.send('delete_community_post', id),
      );

      return communityPost;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createArticle(data: CreateArticleDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.communityClient.send(
          'add_community_article',
          JSON.stringify(data),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateArticle(id: number, data: any): Promise<any> {
    try {
      data.id = id;
      const communityArticle = await firstValueFrom(
        this.communityClient.send(
          'update_community_article',
          JSON.stringify(data),
        ),
      );

      return communityArticle;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getArticlesByCommunity(id: number, data: any): Promise<any> {
    try {
      const new_data: any = data;
      new_data.id = id;
      const communityArticle = await firstValueFrom(
        this.communityClient.send(
          'get_community_article_by_community_id',
          JSON.stringify(new_data),
        ),
      );

      return communityArticle;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getArticleById(id: number): Promise<any> {
    try {
      const communityArticle = await firstValueFrom(
        this.communityClient.send('get_community_article_by_id', id),
      );

      return communityArticle;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteArticle(id: number): Promise<any> {
    try {
      const communityArticle = await firstValueFrom(
        this.communityClient.send('delete_community_article', id),
      );

      return communityArticle;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
