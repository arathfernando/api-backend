import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { YES_NO } from '../constant';

export class UpdateModuleTypeDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public slug: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public short_description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public image: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public partner_id: number;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public published: YES_NO;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public cobuilding: YES_NO;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public beta_testing: YES_NO;
}
