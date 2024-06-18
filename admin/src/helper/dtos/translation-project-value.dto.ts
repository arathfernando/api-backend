import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTranslationProjectValueDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public translation_value: string;

  @ApiProperty()
  @IsNumber()
  translation_project_key_id: number;

  @ApiProperty()
  @IsNumber()
  translation_project_language_id: number;
}

export class UpdateTranslationProjectValueDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public translation_value: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  translation_project_key_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  translation_project_language_id: number;
}
