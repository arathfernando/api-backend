import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { WALKTHROUGH_TYPE } from '../constant';

export class CreateWalkthroughStepDto {
  @ApiProperty()
  @IsNumber()
  public walkthrough_category_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No title provided' })
  public title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No title provided' })
  public step_name: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public content: string;

  @ApiProperty({
    enum: WALKTHROUGH_TYPE,
  })
  @IsEnum(WALKTHROUGH_TYPE)
  @IsNotEmpty({ message: 'Event type is not provided' })
  walkthrough_type: WALKTHROUGH_TYPE;
}

export class UpdateWalkthroughStepDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public walkthrough_category_id: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public step_name: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public content: string;

  @ApiProperty({
    required: false,
    enum: WALKTHROUGH_TYPE,
  })
  @IsOptional()
  @IsEnum(WALKTHROUGH_TYPE)
  walkthrough_type: WALKTHROUGH_TYPE;
}
