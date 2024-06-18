import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CONTEST_STATE, TRUE_FALSE, YES_NO } from 'src/helper/constant';

export class CreateContestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Contest is not provided' })
  public contest_type_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public created_by: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public title: string;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  public industry: string;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  public goals: string;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  public tech: string;

  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  @IsEnum(YES_NO)
  public launch_globally: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public country_contest: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public no_of_participants: number;

  @ApiProperty({
    enum: TRUE_FALSE,
    required: true,
  })
  @IsEnum(TRUE_FALSE)
  public everyone_can_participate: TRUE_FALSE;

  @ApiProperty({
    enum: CONTEST_STATE,
    required: false,
  })
  @IsOptional()
  @IsEnum(CONTEST_STATE)
  public contest_state: CONTEST_STATE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public hubbers_point_attribute: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public no_of_judges: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public no_of_extra_judges: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public no_of_revisions: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public contest_cover: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public contest_start_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public contest_end_date: string;

  @ApiProperty({
    required: false,
    example: `"[{\&quot;social_media\&quot;:1,\&quot;link\&quot;:\&quot;https://www.facebook.com\&quot;}]"`,
    description: 'pass json string as an example',
  })
  @IsOptional()
  public social_links: string;
}
