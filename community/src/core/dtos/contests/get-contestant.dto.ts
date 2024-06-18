import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

enum DTO_CONTESTANT_ROLE {
  ALL = 'ALL',
  JUDGE = 'JUDGE',
  CONTESTANT = 'CONTESTANT',
}

enum DTO_CONTESTANT_STATUS {
  ALL = 'ALL',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
export class GetContestantDto {
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  public contest_id: number;

  @IsEnum(DTO_CONTESTANT_ROLE)
  @ApiProperty({
    enum: DTO_CONTESTANT_ROLE,
    required: true,
  })
  public role: DTO_CONTESTANT_ROLE;

  @IsEnum(DTO_CONTESTANT_STATUS)
  @ApiProperty({
    enum: DTO_CONTESTANT_STATUS,
    required: true,
  })
  public status: DTO_CONTESTANT_STATUS;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
