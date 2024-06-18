import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateShareLocationDto } from '../core/dtos/location/create-share-location.dto';
import { In, Repository } from 'typeorm';
import {
  CommunityLocationPost,
  CommunityTimeline,
  CommunityGroupTimeline,
  GroupActivity,
  Community,
  CommunityTopic,
  CommunityGroup,
} from 'src/database/entities';
import { POST_TYPE, POST_LOCATION } from 'src/core/constant/enum.constant';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ShareLocationService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
    @InjectRepository(CommunityLocationPost)
    private readonly locationShareRepository: Repository<CommunityLocationPost>,
    @InjectRepository(CommunityTimeline)
    private readonly timelineRepository: Repository<CommunityTimeline>,
    @InjectRepository(GroupActivity)
    private readonly groupActivityRepository: Repository<GroupActivity>,
    @InjectRepository(CommunityGroup)
    private readonly communityGroupRepository: Repository<CommunityGroup>,
    @InjectRepository(CommunityGroupTimeline)
    private readonly groupTimelineRepository: Repository<CommunityGroupTimeline>,
  ) {}

  public async createLocationShare(
    data: CreateShareLocationDto,
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

      const post = new CommunityLocationPost();
      post.content = data.content;
      post.location = data.location;
      post.created_by = user_id;
      post.community = community;
      post.post_location = data.post_location;
      post.topics = topics;

      const postCreated = await this.locationShareRepository.save(post);

      if (data.post_location === POST_LOCATION.COMMUNITY) {
        const timeline = new CommunityTimeline();
        timeline.community_id = community.id;
        timeline.created_by = user_id;
        timeline.post_id = postCreated.id;
        timeline.post_type = POST_TYPE.SHARE_LOCATION;

        await this.timelineRepository.save(timeline);
      }

      if (data.post_location === POST_LOCATION.GROUP) {
        const timeline = new CommunityGroupTimeline();
        timeline.group_id = group.id;
        timeline.created_by = user_id;
        timeline.post_id = postCreated.id;
        timeline.post_type = POST_TYPE.SHARE_LOCATION;

        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_id', {
            userId: user_id,
          }),
        );
        const groupActivity = new GroupActivity();
        groupActivity.group = group;
        groupActivity.activity = `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name} left group ${group.group_name}`;
        await this.groupActivityRepository.save(groupActivity);

        await this.groupTimelineRepository.save(timeline);
      }

      return postCreated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateLocationShare(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const post = await this.locationShareRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });

      if (!post) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
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
      if (data.location) {
        post.location = data.location;
      }
      if (data.post_location) {
        post.post_location = data.post_location;
      }

      await this.locationShareRepository.save(post);
      return {
        message: 'Post Share Location successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getLocationPostById(id: number): Promise<any> {
    try {
      return await this.locationShareRepository.findOne({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteLocationPost(id: number, user_id: number): Promise<any> {
    try {
      const post = await this.locationShareRepository.findOne({
        where: {
          id: id,
          created_by: user_id,
        },
      });

      const timeline = await this.timelineRepository.findOne({
        where: {
          post_id: id,
          created_by: user_id,
        },
      });

      if (!post) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.timelineRepository.delete(timeline.id);
      await this.locationShareRepository.delete(id);

      const invitedUser = await firstValueFrom(
        this.userClient.send('get_user_by_id', {
          userId: user_id,
        }),
      );
      const groupActivity = new GroupActivity();
      groupActivity.activity = `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name} Delete a Post in Group`;
      await this.groupActivityRepository.save(groupActivity);

      return {
        message: 'Post deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
