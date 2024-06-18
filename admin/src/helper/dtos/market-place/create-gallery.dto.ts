import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGalleryDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
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
