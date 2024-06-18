import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CONTEST_RULES } from 'src/helper/constant';

export class UpdateContestRuleDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public contest_id: number;

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
    required: false,
    type: [String],
  })
  @IsOptional()
  public attachments: string[];
}
