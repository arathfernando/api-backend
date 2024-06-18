import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { YES_NO } from 'src/core/constant/enum.constant';

export class CourseReactionDto {
  @ApiProperty()
  @IsNumber()
  public course_id: number;

  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public reaction: YES_NO;
}
