import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CONTESTANT_STATUS } from 'src/core/constant/enum.constant';

export class UpdateContestantDto {
  @ApiProperty({
    required: true,
    enum: CONTESTANT_STATUS,
  })
  @IsEnum(CONTESTANT_STATUS)
  public status: CONTESTANT_STATUS;
}
