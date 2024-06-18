import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GIG_STATUS } from 'src/core/constant/enum.constant';

export class UpdateGigDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Expertise Title',
    description: 'The title of the Gig',
  })
  expertise_title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Description',
    description: 'The description of the Gig',
  })
  description?: string;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  workspace_id: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 'CreatedBy',
    description: 'created by user id',
    required: false,
  })
  created_by: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [1, 2], description: 'The categories of the Gig' })
  categories?: number[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @ApiProperty({
    example: [3, 4],
    description: 'The tags of the Gig',
    required: false,
  })
  tags?: number[];

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Product category',
  })
  @IsOptional()
  @IsNumber()
  product_category: number;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Product sub category',
  })
  @IsOptional()
  @IsNumber()
  product_sub_category: number;

  @ApiProperty({
    example: '1',
    description: 'Product sub category faq',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  product_sub_faq: number;

  @IsOptional()
  @IsEnum(GIG_STATUS)
  @ApiProperty({
    enum: GIG_STATUS,
    example: GIG_STATUS.PENDING,
    description: 'The status of the Gig',
  })
  gig_status?: GIG_STATUS;
}
