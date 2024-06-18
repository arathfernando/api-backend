import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CourseCategoryDto {
  @ApiProperty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsString()
  public description: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public prompts_text: string;

  @ApiProperty()
  @IsNumber()
  public created_by: number;
}
