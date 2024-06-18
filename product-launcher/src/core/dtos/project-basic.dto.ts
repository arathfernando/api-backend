import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LAUNCH_TYPE } from '../constant/enum.constant';

export class CreateProjectBasicDTO {
  @ApiProperty({ type: 'string' })
  @IsString()
  project_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  project_description: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  project_market: string;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  product_category: number;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  country: number;

  @ApiProperty({
    required: true,
    enum: LAUNCH_TYPE,
  })
  @IsEnum(LAUNCH_TYPE)
  @IsNotEmpty({ message: 'launch type is not provided.' })
  launch_type: LAUNCH_TYPE;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  language: number;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  price: number;

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  goals: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  innovation_category: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  tech_category: number[];

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public project_image: Express.Multer.File;
}

export class UpdateProjectBasicDTO {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  project_name: string;

  @ApiProperty({
    required: false,
    enum: LAUNCH_TYPE,
  })
  @IsOptional()
  @IsEnum(LAUNCH_TYPE)
  @IsNotEmpty({ message: 'launch type is not provided.' })
  launch_type: LAUNCH_TYPE;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  project_description: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  project_market: string;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  product_category: number;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  country: number;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  language: number;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  goals: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  innovation_category: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  tech_category: number[];

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public project_image: Express.Multer.File;
}
