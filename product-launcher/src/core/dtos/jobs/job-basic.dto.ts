import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JOB_STATUS } from '../../constant/enum.constant';

export class CreateJobBasicDTO {
  @ApiProperty({ type: 'string' })
  @IsString()
  job_name: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  project_id: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  job_description: string;

  @ApiProperty({
    required: true,
    enum: JOB_STATUS,
  })
  @IsEnum(JOB_STATUS)
  @IsNotEmpty({ message: 'job status is not provided.' })
  status: JOB_STATUS;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  price: number;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  skills: number[];

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  attachments: string[];

  @ApiProperty({ type: 'string' })
  @IsString()
  end_date: string;
}

export class UpdateJobBasicDTO {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  job_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  project_id: number;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  job_description: string;

  @ApiProperty({
    required: false,
    enum: JOB_STATUS,
  })
  @IsOptional()
  @IsEnum(JOB_STATUS)
  @IsNotEmpty({ message: 'job status is not provided.' })
  status: JOB_STATUS;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  skills: number[];

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  attachments: string[];

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  end_date: string;
}
