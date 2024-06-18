import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CONTEST_RULES, YES_NO } from '../constant';
import { ContestMarksDto } from './contest-mark.dto';
import { ContestPrizeDto } from './contest-prize.dto';

export class CreateContestTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Template name is not provided' })
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
    required: true,
    isArray: true,
    type: ContestPrizeDto,
  })
  @IsString()
  public contest_prizes: ContestPrizeDto[];

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
  @IsString()
  public contest_marks: ContestMarksDto[];

  @ApiProperty({
    enum: CONTEST_RULES,
    required: true,
  })
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
  @IsOptional()
  public attachments: any[];
}
