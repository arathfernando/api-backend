import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CommunityMembersService {
  constructor(
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
  ) {
    this.communityClient.connect();
  }

  public async getAllCommunityUsers(
    limit: number,
    page_no: number,
  ): Promise<any> {
    try {
      const skip = limit * page_no - limit;

      const users = await firstValueFrom(
        this.communityClient.send(
          'get_all_community_users',
          JSON.stringify({
            take: limit,
            skip,
          }),
        ),
      );

      return users;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCommunityMember(id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.communityClient.send('get_community_member_by_id', {
          userId: id,
        }),
      );

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteCommunityMember(id: number): Promise<any> {
    try {
      await firstValueFrom(
        this.communityClient.send('delete_community_member', {
          userId: id,
        }),
      );

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
