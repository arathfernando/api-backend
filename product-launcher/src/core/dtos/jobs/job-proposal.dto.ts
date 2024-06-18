import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PROPOSAL_JOB_STATUS,
  PROPOSAL_RATE_TYPE,
  PROPOSAL_STATUS,
} from '../../constant/enum.constant';

export class CreateJobProposalDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  job_id: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  bid_description: string;

  @ApiProperty({
    required: true,
    enum: PROPOSAL_STATUS,
  })
  @IsEnum(PROPOSAL_STATUS)
  @IsNotEmpty({ message: 'proposal status is not provided.' })
  status: PROPOSAL_STATUS;

  @ApiProperty({
    required: true,
    enum: PROPOSAL_JOB_STATUS,
  })
  @IsEnum(PROPOSAL_JOB_STATUS)
  @IsNotEmpty({ message: 'proposal status is not provided.' })
  proposal_job_status: PROPOSAL_JOB_STATUS;

  @ApiProperty({
    required: true,
    enum: PROPOSAL_RATE_TYPE,
  })
  @IsEnum(PROPOSAL_RATE_TYPE)
  @IsNotEmpty({ message: 'proposal status is not provided.' })
  rate_type: PROPOSAL_RATE_TYPE;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  rate: number;

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
  delivery_date: string;
}

export class UpdateJobProposalDTO {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  job_id: number;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  bid_description: string;

  @ApiProperty({
    required: false,
    enum: PROPOSAL_STATUS,
  })
  @IsOptional()
  @IsEnum(PROPOSAL_STATUS)
  @IsNotEmpty({ message: 'proposal status is not provided.' })
  status: PROPOSAL_STATUS;

  @ApiProperty({
    required: false,
    enum: PROPOSAL_JOB_STATUS,
  })
  @IsEnum(PROPOSAL_JOB_STATUS)
  @IsOptional()
  @IsNotEmpty({ message: 'proposal status is not provided.' })
  proposal_job_status: PROPOSAL_JOB_STATUS;

  @ApiProperty({
    required: false,
    enum: PROPOSAL_RATE_TYPE,
  })
  @IsOptional()
  @IsEnum(PROPOSAL_RATE_TYPE)
  @IsNotEmpty({ message: 'proposal status is not provided.' })
  rate_type: PROPOSAL_RATE_TYPE;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  rate: number;

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
  delivery_date: string;
}
