import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateTopicDto,
  GetTopicByStatus,
  UpdateTopicDto,
} from 'src/helper/dtos';
import { S3Service } from 'src/helper/services/s3/s3.service';

@Injectable()
export class CommunityTopicsService {
  constructor(
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) {
    this.communityClient.connect();
  }

  async createCommunityTopic(data: CreateTopicDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.communityClient.send('add_community_topic', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateCommunityTopic(
    data: UpdateTopicDto,
    id: number,
  ): Promise<any> {
    try {
      const new_data: any = data;
      new_data.id = id;

      await firstValueFrom(
        this.communityClient.send(
          'update_community_topic',
          JSON.stringify(new_data),
        ),
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

  public async getAllCommunityTopics(
    limit: number,
    page_no: number,
  ): Promise<any> {
    try {
      const skip = limit * page_no - limit;

      const communityTopics = await firstValueFrom(
        this.communityClient.send(
          'get_all_community_topics',
          JSON.stringify({
            take: limit,
            skip,
          }),
        ),
      );

      return communityTopics;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunityTopic(id: number): Promise<any> {
    try {
      const communityTopic = await firstValueFrom(
        this.communityClient.send('get_community_topic_by_id', id),
      );

      return communityTopic;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCommunityTopic(id: number): Promise<any> {
    try {
      await firstValueFrom(
        this.communityClient.send('delete_community_topic', id),
      );

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunityTopicByCommunityid(id: number) {
    try {
      const communityTopic = await firstValueFrom(
        this.communityClient.send('get_community_topic_by_community_id', id),
      );

      return communityTopic;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTopicByStatus(status: GetTopicByStatus): Promise<any> {
    try {
      const topic = await firstValueFrom(
        this.communityClient.send('get_topics_by_status', status.status),
      );

      return topic;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
