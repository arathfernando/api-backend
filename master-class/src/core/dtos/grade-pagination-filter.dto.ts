import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TIME_DURATION } from '../constant/enum.constant';

export class GradePaginationDto {
  @ApiProperty({
    required: false,
    enum: TIME_DURATION,
  })
  @IsOptional()
  @IsEnum(TIME_DURATION)
  public time_duration: TIME_DURATION;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
