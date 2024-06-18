import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { YES_NO } from 'src/helper/constant';
import { ContestMarksDto } from './contest-mark.dto';
import { ContestOwnCriteriaDto } from './contest-own-criteria.dto';
import { ContestPrizeDto } from './contest-prize.dto';

export class CreateContestCriteriaDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public contest_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public contest_description: string;

  @ApiProperty({
    required: true,
    isArray: true,
    type: ContestPrizeDto,
  })
  @IsArray()
  public contest_prizes: ContestPrizeDto[];

  @ApiProperty({
    required: true,
    isArray: true,
    type: ContestOwnCriteriaDto,
  })
  @IsArray()
  public contest_own_criteria: ContestOwnCriteriaDto[];

  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  @IsEnum(YES_NO)
  public own_criteria: YES_NO;

  @ApiProperty({
    required: true,
    isArray: true,
    type: ContestMarksDto,
  })
  @IsArray()
  public contest_marks: ContestMarksDto[];
}
