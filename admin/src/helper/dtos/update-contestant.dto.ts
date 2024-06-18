import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
export enum CONTESTANT_STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class UpdateContestantDto {
  @ApiProperty({
    required: true,
    enum: CONTESTANT_STATUS,
  })
  @IsEnum(CONTESTANT_STATUS)
  public status: CONTESTANT_STATUS;
}
