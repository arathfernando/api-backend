import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCourseCategoryDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public prompts_text: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public created_by: number;
}
