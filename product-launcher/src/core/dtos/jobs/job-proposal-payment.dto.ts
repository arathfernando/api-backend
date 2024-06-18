import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PROPOSAL_PAYMENT_TYPE } from 'src/core/constant/enum.constant';

export class CreateJobProposalPaymentDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  job_proposal_id: number;

  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    required: true,
    enum: PROPOSAL_PAYMENT_TYPE,
  })
  @IsEnum(PROPOSAL_PAYMENT_TYPE)
  @IsNotEmpty({ message: 'payment type is not provided.' })
  payment_type: PROPOSAL_PAYMENT_TYPE;
}
