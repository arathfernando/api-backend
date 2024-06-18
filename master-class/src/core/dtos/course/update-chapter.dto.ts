import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { COURSE_ACCESS_TYPE } from 'src/core/constant/enum.constant';

export class UpdateCourseChapterDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public chapter_title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public chapter_description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  public media: string[];

  @ApiProperty({
    required: false,
    enum: COURSE_ACCESS_TYPE,
  })
  @IsOptional()
  @IsEnum(COURSE_ACCESS_TYPE)
  public course_access_type: COURSE_ACCESS_TYPE;
}
