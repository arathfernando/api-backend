import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { FILE_TYPE } from 'src/core/constant/enum.constant';
export class UpdateLessonActivityDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'lesson id not provided' })
  public lesson_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'file name not provided' })
  public file_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'file description not provided' })
  public file_description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'file url not provided' })
  public file_url: string;

  @ApiProperty({
    required: false,
    enum: FILE_TYPE,
  })
  @IsOptional()
  @IsEnum(FILE_TYPE)
  public file_type: FILE_TYPE;
}
