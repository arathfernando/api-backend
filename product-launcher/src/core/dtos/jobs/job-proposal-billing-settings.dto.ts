import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PROPOSAL_BILLING_FREQUENCY,
  PROPOSAL_PAYMENT_TYPE,
} from 'src/core/constant/enum.constant';

export class CreateJobProposalBillingSettingDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  job_proposal_id: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  expertise_user_id: number;

  @ApiProperty({
    required: false,
    enum: PROPOSAL_PAYMENT_TYPE,
  })
  @IsOptional()
  @IsEnum(PROPOSAL_PAYMENT_TYPE)
  @IsNotEmpty({ message: 'payment type is not provided.' })
  payment_type: PROPOSAL_PAYMENT_TYPE;

  @ApiProperty({
    required: false,
    enum: PROPOSAL_BILLING_FREQUENCY,
  })
  @IsOptional()
  @IsEnum(PROPOSAL_BILLING_FREQUENCY)
  @IsNotEmpty({ message: 'billing frequency is not provided.' })
  billing_frequency: PROPOSAL_BILLING_FREQUENCY;
}

export class UpdateJobProposalBillingSettingDTO {
  @ApiProperty({ example: 1, required: false })
  @IsNotEmpty()
  @IsOptional()
  job_proposal_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  expertise_user_id: number;

  @ApiProperty({
    required: false,
    enum: PROPOSAL_PAYMENT_TYPE,
  })
  @IsEnum(PROPOSAL_PAYMENT_TYPE)
  @IsOptional()
  @IsNotEmpty({ message: 'payment type is not provided.' })
  payment_type: PROPOSAL_PAYMENT_TYPE;

  @ApiProperty({
    required: false,
    enum: PROPOSAL_BILLING_FREQUENCY,
  })
  @IsEnum(PROPOSAL_BILLING_FREQUENCY)
  @IsOptional()
  @IsNotEmpty({ message: 'billing frequency is not provided.' })
  billing_frequency: PROPOSAL_BILLING_FREQUENCY;
}
