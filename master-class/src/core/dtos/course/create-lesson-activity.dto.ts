import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { FILE_TYPE } from 'src/core/constant/enum.constant';
export class CreateLessonActivityDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'lesson id not provided' })
  public lesson_id: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'file name not provided' })
  public file_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public file_description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public file_url: string;

  @ApiProperty({
    required: true,
    enum: FILE_TYPE,
  })
  @IsEnum(FILE_TYPE)
  public file_type: FILE_TYPE;
}
