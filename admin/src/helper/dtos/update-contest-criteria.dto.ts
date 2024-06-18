import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { YES_NO } from 'src/helper/constant';
import { ContestMarksDto } from './contest-mark.dto';
import { ContestOwnCriteriaDto } from './contest-own-criteria.dto';
import { ContestPrizeDto } from './contest-prize.dto';

export class UpdateContestCriteriaDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public contest_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public contest_description: string;

  @ApiProperty({
    required: false,
    isArray: true,
    type: [ContestPrizeDto],
  })
  @IsOptional()
  @IsArray()
  public contest_prizes: ContestPrizeDto[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: [ContestOwnCriteriaDto],
  })
  @IsOptional()
  @IsArray()
  public contest_own_criteria: ContestOwnCriteriaDto[];

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public own_criteria: YES_NO;

  @ApiProperty({
    required: false,
    isArray: true,
    type: [ContestMarksDto],
  })
  @IsOptional()
  @IsArray()
  public contest_marks: ContestMarksDto[];
}
