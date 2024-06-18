import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDefaultCriteriaDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Contest category id not provided' })
  contest_category_id: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  weightage: number;
}
