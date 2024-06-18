import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { CONTESTANT_ROLE } from 'src/core/constant/enum.constant';

export class JoinContest {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public contest_id: number;

  @ApiProperty({
    required: true,
    enum: CONTESTANT_ROLE,
  })
  @IsEnum(CONTESTANT_ROLE)
  public role: CONTESTANT_ROLE;
}
