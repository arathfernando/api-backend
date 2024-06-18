import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TRUE_FALSE } from '../constant';

export class CreateTranslationProjectLanguageDto {
  @ApiProperty()
  @IsNumber()
  translation_project_id: number;

  @ApiProperty()
  @IsNumber()
  translation_language_id: number;

  @ApiProperty({
    required: true,
    enum: TRUE_FALSE,
  })
  @IsEnum(TRUE_FALSE)
  public is_default: TRUE_FALSE;
}

export class UpdateTranslationProjectLanguageDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  translation_project_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  translation_language_id: number;

  @ApiProperty({
    required: true,
    enum: TRUE_FALSE,
  })
  @IsEnum(TRUE_FALSE)
  public is_default: TRUE_FALSE;
}
