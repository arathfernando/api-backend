import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGalleryDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public image: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    description: 'Image title',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_title?: string;

  @ApiProperty({
    type: 'string',
    description: 'Image description',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_description?: string;
}
