import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export enum PROPOSAL_FILTER {
  LATEST = 'LATEST',
  OLDEST = 'OLDEST',
  HIGHEST = 'HIGHEST',
  LOWEST = 'LOWEST',
}

export class JobProposalFilterDTO {
  @ApiProperty({
    required: true,
    enum: PROPOSAL_FILTER,
  })
  @IsOptional()
  @IsEnum(PROPOSAL_FILTER)
  filter: PROPOSAL_FILTER;
}
