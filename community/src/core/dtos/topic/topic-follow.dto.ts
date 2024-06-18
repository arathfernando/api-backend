import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { FOLLOW_REACTION_TYPE } from 'src/core/constant/enum.constant';

export class TopicFollowDto {
  @ApiProperty()
  @IsNumber()
  public id: number;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  @ApiProperty({
    required: true,
    enum: FOLLOW_REACTION_TYPE,
  })
  @IsEnum(FOLLOW_REACTION_TYPE)
  public reaction_type: FOLLOW_REACTION_TYPE;
}
