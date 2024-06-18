import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { YES_NO } from '../constant';

export class CreateModuleTypeDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Module name is not provided' })
  public name: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  public slug: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  public short_description: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  public description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public image: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public partner_id: number;

  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  @IsEnum(YES_NO)
  public published: YES_NO;

  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  @IsEnum(YES_NO)
  public cobuilding: YES_NO;

  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  @IsEnum(YES_NO)
  public beta_testing: YES_NO;
}
