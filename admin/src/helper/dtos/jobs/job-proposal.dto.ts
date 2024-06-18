import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export enum PROPOSAL_STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}
export enum PROPOSAL_RATE_TYPE {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
}
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
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public created_by: number;

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
  })
  @IsOptional()
  @IsNumber()
  public created_by: number;

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
