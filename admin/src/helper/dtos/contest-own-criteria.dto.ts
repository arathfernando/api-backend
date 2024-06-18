import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ContestOwnCriteriaDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public weightage: number;
}
