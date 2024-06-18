import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GIG_STATUS } from './update-gig.dto';

export class CreateGigDto {
  @IsString()
  @ApiProperty({
    example: 'Expertise Title',
    description: 'The title of the Gig',
  })
  expertise_title: string;

  @IsString()
  @ApiProperty({
    example: 'Description',
    description: 'The description of the Gig',
  })
  description: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public created_by: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public workspace_id: number;

  @ApiProperty({
    required: true,
    enum: GIG_STATUS,
  })
  @IsEnum(GIG_STATUS)
  @IsNotEmpty({ message: 'gig status is not provided.' })
  gig_status: GIG_STATUS;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [1, 2], description: 'The categories of the Gig' })
  categories: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [3, 4], description: 'The tags of the Gig' })
  tags: number;

  @IsNumber()
  @ApiProperty({
    description: 'Product category',
    required: false,
  })
  @IsOptional()
  product_category: number;

  @IsNumber()
  @ApiProperty({
    description: 'Product sub category',
    required: false,
  })
  @IsOptional()
  product_sub_category: number;

  @IsNumber()
  @ApiProperty({
    description: 'Product sub category faq',
    required: false,
  })
  @IsOptional()
  product_sub_faq: number;
}
