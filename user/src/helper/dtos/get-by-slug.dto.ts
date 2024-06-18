import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetBySlugDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public id: number;
}
