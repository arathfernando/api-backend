import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EXP_TEACHER, YES_NO } from '../constant';

export class TeacherDto {
  @IsEnum(EXP_TEACHER)
  @ApiProperty({
    enum: EXP_TEACHER,
    required: true,
  })
  public experience_teacher: EXP_TEACHER;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  public language?: number[];

  @IsEnum(YES_NO)
  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  public have_geo_preference: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public geo_preference?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public city?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description?: string;
}

export class UpdateTeacherDto {
  @IsEnum(EXP_TEACHER)
  @ApiProperty({
    enum: EXP_TEACHER,
    required: false,
  })
  @IsOptional()
  public experience_teacher: EXP_TEACHER;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  public language?: number[];

  @IsEnum(YES_NO)
  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  public have_geo_preference: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public geo_preference?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public city?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description?: string;
}
