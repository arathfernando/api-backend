import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { REACTION_TYPE } from 'src/core/constant/enum.constant';

export class GetTopicLikesDto {
  @ApiProperty()
  @IsNumber()
  public id: number;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  @IsEnum(REACTION_TYPE)
  @ApiProperty({
    enum: REACTION_TYPE,
    required: true,
  })
  public reaction_type: REACTION_TYPE;
}
