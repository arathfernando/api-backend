import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class OpenCategoryDto {
  @ApiProperty()
  @IsNumber()
  public id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;
}
