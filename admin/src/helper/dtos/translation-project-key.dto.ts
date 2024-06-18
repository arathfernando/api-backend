import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTranslationProjectKeyDto {
  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  public translation_key: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public namespace: string;

  @ApiProperty()
  @IsNumber()
  translation_project_id: number;
}

export class UpdateTranslationProjectKeyDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public translation_key: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public namespace: string;

  @ApiProperty()
  @IsNumber()
  translation_project_id: number;
}
