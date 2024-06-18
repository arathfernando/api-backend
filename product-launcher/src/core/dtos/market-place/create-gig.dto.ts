import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsNumber()
  @ApiProperty({
    example: 'CreatedBy',
    description: 'created by user id',
  })
  created_by: number;

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

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  workspace_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [1, 2], description: 'The categories of the Gig' })
  categories: number[];

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [3, 4], description: 'The tags of the Gig' })
  tags: number[];
}
