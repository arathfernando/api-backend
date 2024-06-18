import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLanguageLevelDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public language_level_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;
}
