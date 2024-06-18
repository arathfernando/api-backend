import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CONTEST_RULES, YES_NO } from '../constant';
import { ContestMarksDto } from './contest-mark.dto';
import { ContestPrizeDto } from './contest-prize.dto';

export class UpdateContestTemplateDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public template_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public template_category: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public contest_description: string;

  @ApiProperty({
    required: false,
    isArray: true,
    type: ContestPrizeDto,
  })
  @IsOptional()
  @IsString()
  public contest_prizes: ContestPrizeDto[];

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
    type: ContestMarksDto,
  })
  @IsOptional()
  @IsString()
  public contest_marks: ContestMarksDto[];

  @ApiProperty({
    enum: CONTEST_RULES,
    required: false,
  })
  @IsOptional()
  @IsEnum(CONTEST_RULES)
  public contest_rules: CONTEST_RULES;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public other_description: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
    required: false,
  })
  public attachments: any[];
}
