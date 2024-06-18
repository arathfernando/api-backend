import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import {
  ChooseGoalDto,
  CreateUserDto,
  HubbersTeamProfileDto,
  PaginationDto,
  UpdateEducationDto,
  UpdateGeneralProfileDto,
  UpdateHubbersTeamProfileDto,
  UpdateSocialMediaDto,
  UpdateUserInterestDto,
  UpdateWorkExpDto,
} from 'src/helper/dtos';
import { UpdateUserDto } from 'src/helper/dtos/update-user.dto';
import { S3Service } from 'src/helper/services/s3/s3.service';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) {}

  public async createUser(avatar: any, data: CreateUserDto): Promise<any> {
    try {
      let logo;

      if (avatar) {
        logo = await this.s3Service.uploadFile(avatar);
        logo = logo.Location;
      }

      const userD: any = data;
      userD.avatar = logo;

      const createdRes = await firstValueFrom(
        this.userClient.send('add_user', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUser(
    avatar: any,
    data: UpdateUserDto,
    id: number,
  ): Promise<any> {
    try {
      let logo;

      if (avatar) {
        logo = await this.s3Service.uploadFile(avatar);
      }

      const userD: any = data;
      userD.id = id;
      if (logo) {
        userD.avatar = logo.Location;
      }
      const user = await firstValueFrom(
        this.userClient.send('update_user', JSON.stringify(data)),
      );

      return user;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllUsers(limit: number, page_no: number): Promise<any> {
    try {
      const skip = limit * page_no - limit;

      const users = await firstValueFrom(
        this.userClient.send(
          'get_all_users',
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

  public async getUser(id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send('get_user_by_id', {
          userId: id,
        }),
      );

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGeneralProfileByUserId(id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send('get_general_profile_by_id', {
          userId: id,
        }),
      );

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteUser(id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send('delete_user', {
          userId: id,
        }),
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGeneralProfile(
    avatar: any,
    data: UpdateGeneralProfileDto,
    user_id: number,
  ): Promise<any> {
    try {
      let logo;

      const userD: any = data;
      if (avatar) {
        logo = await this.s3Service.uploadFile(avatar);
        userD.avatar = logo ? logo.Location : null;
      }

      userD.id = user_id;
      const user = await firstValueFrom(
        this.userClient.send('update_general_profile', JSON.stringify(userD)),
      );

      return user;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateWorkExperience(
    data: UpdateWorkExpDto,
    id: number,
  ): Promise<any> {
    try {
      const userD: any = data;
      userD.user_id = id;
      return await firstValueFrom(
        this.userClient.send('update_work_experience', JSON.stringify(userD)),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateSocialMedia(
    data: UpdateSocialMediaDto,
    id: number,
  ): Promise<any> {
    try {
      const userD: any = data;
      userD.user_id = id;
      return await firstValueFrom(
        this.userClient.send('update_social_media', JSON.stringify(userD)),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateEducation(
    data: UpdateEducationDto,
    id: number,
  ): Promise<any> {
    try {
      const userD: any = data;
      userD.user_id = id;

      return await firstValueFrom(
        this.userClient.send('update_education', JSON.stringify(userD)),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserInterest(
    data: UpdateUserInterestDto,
    user_id: number,
  ): Promise<any> {
    try {
      const userD: any = data;
      userD.id = user_id;

      return await firstValueFrom(
        this.userClient.send('update_user_interest', JSON.stringify(userD)),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserGoal(
    data: ChooseGoalDto,
    user_id: number,
  ): Promise<any> {
    try {
      const userD: any = data;
      userD.id = user_id;

      return await firstValueFrom(
        this.userClient.send('update_goal', JSON.stringify(userD)),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async createPartner(data: any, file: any): Promise<any> {
    try {
      if (file) {
        const image = await this.s3Service.uploadFile(file);
        data.partner_image = image.Location;
      }
      const user = await firstValueFrom(
        this.userClient.send('create_partner', JSON.stringify(data)),
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updatePartner(id: number, data: any, file: any): Promise<any> {
    try {
      if (file) {
        const image = await this.s3Service.uploadFile(file);
        data.partner_image = image.Location;
      }

      return await firstValueFrom(
        this.userClient.send(
          'update_partner',
          JSON.stringify({
            id: id,
            data: data,
          }),
        ),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPartners(data: PaginationDto): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send('get_partners', JSON.stringify(data)),
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPartnerById(id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send('get_partner_by_id', id),
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async deletePartner(id: number): Promise<any> {
    try {
      return await firstValueFrom(this.userClient.send('delete_partner', id));
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createHubberTeamProfile(
    data: HubbersTeamProfileDto,
  ): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send(
          'create_hubber_team_profile',
          JSON.stringify(data),
        ),
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateHubberTeamProfile(
    id: number,
    data: UpdateHubbersTeamProfileDto,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.userClient.send(
          'update_hubber_team_profile',
          JSON.stringify({ id, data }),
        ),
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getHubberTeamProfile(data: PaginationDto): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send('get_hubber_team_profile', JSON.stringify(data)),
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async removeHubberProfile(id: number): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.userClient.send('remove_hubber_profile', id),
      );
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateHubberTeamProfileOrder(data: any): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userClient.send(
          'update_hubber_team_profile_order',
          JSON.stringify(data),
        ),
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
