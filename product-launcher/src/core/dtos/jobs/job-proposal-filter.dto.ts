import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PROPOSAL_FILTER, PROPOSAL_STATUS } from '../../constant/enum.constant';

export class JobProposalFilterDTO {
  @ApiProperty({
    required: true,
    enum: PROPOSAL_FILTER,
  })
  @IsOptional()
  @IsEnum(PROPOSAL_FILTER)
  filter: PROPOSAL_FILTER;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;

  @ApiProperty({
    required: false,
    enum: PROPOSAL_STATUS,
  })
  @IsOptional()
  @IsEnum(PROPOSAL_STATUS)
  proposal_status: PROPOSAL_STATUS;
}
