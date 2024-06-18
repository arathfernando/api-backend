import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PROPOSAL_JOB_STATUS } from '../../constant/enum.constant';

export class ProposalJobStatusDto {
  @ApiProperty({
    required: true,
    enum: PROPOSAL_JOB_STATUS,
  })
  @IsEnum(PROPOSAL_JOB_STATUS)
  @IsNotEmpty({ message: 'proposal job status is not provided.' })
  proposal_job_status: PROPOSAL_JOB_STATUS;
}
