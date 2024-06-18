import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { S3Service } from 'src/helper/services/s3/s3.service';
import {
  GetByIdDto,
  GetGroupByStatus,
  UpdateGroupStatusDto,
} from 'src/helper/dtos';

@Injectable()
export class CommunityGroupService {
  constructor(
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) {
    this.communityClient.connect();
  }

  public async addCommunityGroups(data: any, avatar: any): Promise<any> {
    try {
      let cover_img;

      if (avatar) {
        cover_img = await this.s3Service.uploadFile(avatar);
      }
      data.cover_img = cover_img.Location;
      data.user_id = data.created_by;

      const createdRes = await firstValueFrom(
        this.communityClient.send(
          'create_community_group',
          JSON.stringify(data),
        ),
      );
      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGroup(id: number, data: any, file: any): Promise<any> {
    try {
      let cover_page;
      if (file) {
        cover_page = await this.s3Service.uploadFile(file);
        data.cover_page = cover_page.Location;
      }
      data.id = id;
      const updateRes = await firstValueFrom(
        this.communityClient.send('update_group', JSON.stringify(data)),
      );
      return updateRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllGroups(data: any): Promise<any> {
    try {
      const users = await firstValueFrom(
        this.communityClient.send('get_all_group', JSON.stringify(data)),
      );

      return users;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGroupById(id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.communityClient.send('get_group_by_id', id),
      );

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGroupsByCommunity(id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.communityClient.send('get_groups_by_community', id),
      );

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteGroup(id: number): Promise<any> {
    try {
      await firstValueFrom(this.communityClient.send('delete_group', id));

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGroupByStatus(status: GetGroupByStatus): Promise<any> {
    try {
      const group = await firstValueFrom(
        this.communityClient.send('get_groups_by_status', status.status),
      );

      return group;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAdminGroupStatus(
    id: GetByIdDto,
    status: UpdateGroupStatusDto,
  ): Promise<any> {
    try {
      const communityEvents = await firstValueFrom(
        this.communityClient.send('change_group_status', {
          id: id.id,
          status: status.status,
        }),
      );

      return communityEvents;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
