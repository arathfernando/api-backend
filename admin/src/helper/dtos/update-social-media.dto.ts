import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { SocialMediaDto } from './social-media.dto';

export class UpdateSocialMediaDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: SocialMediaDto,
  })
  @IsArray()
  public social_media: SocialMediaDto;
}
