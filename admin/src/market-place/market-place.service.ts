import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateFaqDto } from 'src/helper/dtos/market-place/create-faq.dto';
import { CreateFeedbackDto } from 'src/helper/dtos/market-place/create-feedback.dto';
import { CreateGigDto } from 'src/helper/dtos/market-place/create-gig.dto';
import { CreatePackageDto } from 'src/helper/dtos/market-place/create-package.dto';
import { CreateGigCategoryDto } from 'src/helper/dtos/market-place/gig-category.dto';
import {
  CreateRequestResponseDto,
  GIG_RESPONSE_STATUS,
  UpdateRequestResponseDto,
} from 'src/helper/dtos/market-place/req-res.dto';
import { UpdateFaqDto } from 'src/helper/dtos/market-place/update-faq.dto';
import { UpdateFeedbackDto } from 'src/helper/dtos/market-place/update-feedback.dto';
import { UpdateGalleryDto } from 'src/helper/dtos/market-place/update-gallery.dto';
import { UpdatePackageDto } from 'src/helper/dtos/market-place/update-package.dto';
import { UpdateRequestDto } from 'src/helper/dtos/market-place/update-request.dto';
import { S3Service } from 'src/helper/services/s3/s3.service';

@Injectable()
export class MarketPlaceService {
  constructor(
    @Inject('PRODUCT_LAUNCHER')
    private readonly marketPlaceClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) {}

  async createCategory(data: CreateGigCategoryDto, cover: any): Promise<any> {
    try {
      let avatar;

      if (cover) {
        avatar = await this.s3Service.uploadFile(cover);
        data.cover = avatar.Location;
      }
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send('add_gig_category', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigCategory(
    id: number,
    data: any,
    cover: any,
  ): Promise<any> {
    try {
      const new_data: any = data;
      new_data.id = id;
      let avatar;
      if (cover) {
        avatar = await this.s3Service.uploadFile(cover);
      }
      if (avatar) {
        data.cover = avatar.Location;
      }
      await firstValueFrom(
        this.marketPlaceClient.send(
          'update_gig_category',
          JSON.stringify(new_data),
        ),
      );

      return {
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigCategoryById(id: number): Promise<any> {
    try {
      const gigCategory = await firstValueFrom(
        this.marketPlaceClient.send('get_gig_category_by_id', id),
      );
      return gigCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigAllCategory(): Promise<any> {
    try {
      const gigCategory = await firstValueFrom(
        this.marketPlaceClient.send('get_gig_all_category', ''),
      );
      return gigCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteGigCategory(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.marketPlaceClient.send('delete_gig_category', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createGig(data: CreateGigDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send('add_gig', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGig(id: number, data: any): Promise<any> {
    try {
      const new_data: any = data;
      new_data.id = id;

      await firstValueFrom(
        this.marketPlaceClient.send('update_gig', JSON.stringify(new_data)),
      );

      return {
        message: 'Updated successfully',
      };
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllGigs(data: any): Promise<any> {
    try {
      const gigs = await firstValueFrom(
        this.marketPlaceClient.send('get_all_gigs', JSON.stringify(data)),
      );

      return gigs;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigById(id: number): Promise<any> {
    try {
      const gig = await firstValueFrom(
        this.marketPlaceClient.send(
          'get_gig_by_id',
          JSON.stringify({ id: id, user_id: 0 }),
        ),
      );
      return gig;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteGig(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.marketPlaceClient.send('delete_gig', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createPackage(data: CreatePackageDto[]): Promise<any> {
    try {
      const new_data: any = data;
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send(
          'add_package',
          JSON.stringify({ data: new_data }),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigPackage(updateData: UpdatePackageDto[]): Promise<any> {
    try {
      const data: any = updateData;

      const gigPackage = await firstValueFrom(
        this.marketPlaceClient.send('update_package', JSON.stringify(data)),
      );

      return gigPackage;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigPackageByGigId(id: number): Promise<any> {
    try {
      const gigPackage = await firstValueFrom(
        this.marketPlaceClient.send('get_gig_package_by_gig_id', id),
      );
      return gigPackage;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deletePackage(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.marketPlaceClient.send('delete_package', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createGigGallery(gigId: number, data: any, image: any): Promise<any> {
    try {
      let cover_img;

      if (image) {
        cover_img = await this.s3Service.uploadFile(image);
      }

      const adminDto: any = data;
      adminDto.image = cover_img.Location;
      adminDto.gig_id = gigId;
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send(
          'add_gig_gallery',
          JSON.stringify(adminDto),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigGallery(
    gigId: number,
    id: number,
    data: UpdateGalleryDto,
    image: any,
  ): Promise<any> {
    try {
      let cover_img;

      if (image) {
        cover_img = await this.s3Service.uploadFile(image);
      }

      const new_data: any = data;
      new_data.id = id;
      new_data.gig_id = gigId;
      if (cover_img) {
        new_data.image_url = cover_img.Location;
      }
      const gallery = await firstValueFrom(
        this.marketPlaceClient.send(
          'update_gig_gallery',
          JSON.stringify(new_data),
        ),
      );

      return gallery;
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigGalleryByGigId(id: number): Promise<any> {
    try {
      const gigGallery = await firstValueFrom(
        this.marketPlaceClient.send('get_gig_gallery_by_gig_id', id),
      );
      return gigGallery;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteGallery(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.marketPlaceClient.send('delete_gig_gallery', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createGigRequest(gigId: number, data: any, image: any): Promise<any> {
    try {
      let cover_img;

      if (image) {
        cover_img = await this.s3Service.uploadFile(image);
      }

      const adminDto: any = data;
      adminDto.image = cover_img.Location;
      adminDto.gig_id = gigId;
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send(
          'add_gig_request',
          JSON.stringify(adminDto),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigRequest(
    gigId: number,
    id: number,
    data: UpdateRequestDto,
    image: any,
  ): Promise<any> {
    try {
      let cover_img;

      if (image) {
        cover_img = await this.s3Service.uploadFile(image);
      }

      const new_data: any = data;
      new_data.id = id;
      new_data.gig_id = gigId;
      if (cover_img) {
        new_data.image = cover_img.Location;
      }
      await firstValueFrom(
        this.marketPlaceClient.send(
          'update_gig_request',
          JSON.stringify(new_data),
        ),
      );

      return {
        message: 'Updated successfully',
      };
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigRequestByGigId(id: number): Promise<any> {
    try {
      const gigRequest = await firstValueFrom(
        this.marketPlaceClient.send('get_gig_request_by_gig_id', id),
      );
      return gigRequest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteRequest(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.marketPlaceClient.send('delete_gig_request', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createGigRequestResponse(data: CreateRequestResponseDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send(
          'add_gig_request_response',
          JSON.stringify(data),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigRequestResponse(
    id: number,
    updateData: UpdateRequestResponseDto,
  ): Promise<any> {
    try {
      const data: any = updateData;
      data.id = id;
      await firstValueFrom(
        this.marketPlaceClient.send(
          'update_request_response',
          JSON.stringify(data),
        ),
      );

      return {
        message: 'Updated successfully',
      };
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigRequestResponseByReqId(
    id: number,
    response_status: GIG_RESPONSE_STATUS,
  ): Promise<any> {
    try {
      const gigRequestResponse = await firstValueFrom(
        this.marketPlaceClient.send(
          'get_gig_request_response_by_gig_id',
          JSON.stringify({ id, response_status }),
        ),
      );
      return gigRequestResponse;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteRequestResponse(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.marketPlaceClient.send('delete_gig_request_response', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createFaq(data: CreateFaqDto[]): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send('add_gig_faq', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigFaq(updateData: UpdateFaqDto[]): Promise<any> {
    try {
      const data: any = updateData;

      const gigPackage = await firstValueFrom(
        this.marketPlaceClient.send('update_gig_faq', JSON.stringify(data)),
      );
      return gigPackage;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGigFaqByGigId(id: number): Promise<any> {
    try {
      const gigPackage = await firstValueFrom(
        this.marketPlaceClient.send('get_gig_faq_by_gig_id', id),
      );
      return gigPackage;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteFaq(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.marketPlaceClient.send('delete_gig_faq', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createFeedback(data: CreateFeedbackDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.marketPlaceClient.send('add_gig_feedback', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGigFeedback(
    id: number,
    updateData: UpdateFeedbackDto,
  ): Promise<any> {
    try {
      const data: any = updateData;
      data.id = id;
      return await firstValueFrom(
        this.marketPlaceClient.send(
          'update_gig_feedback',
          JSON.stringify(data),
        ),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllFeedback(data: any): Promise<any> {
    try {
      const gigRequest = await firstValueFrom(
        this.marketPlaceClient.send(
          'get_all_gig_feedback',
          JSON.stringify(data),
        ),
      );
      return gigRequest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteFeedback(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.marketPlaceClient.send('delete_gig_feedback', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
