import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobProposalReplyDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  job_proposal_id: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  message: string;
}

export class UpdateJobProposalReplyDTO {
  @ApiProperty({ example: 1, required: false })
  @IsNotEmpty()
  @IsOptional()
  job_proposal_id: number;

  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  message: string;
}
