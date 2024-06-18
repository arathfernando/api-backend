import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { COMMUNITY_TYPE, TRUE_FALSE } from 'src/core/constant/enum.constant';

export class CommunityAdvanceSearchDto {
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
  @IsNumber()
  public country: number;

  @ApiProperty({
    required: false,
    enum: COMMUNITY_TYPE,
  })
  @IsOptional()
  @IsEnum(COMMUNITY_TYPE)
  public community_type: COMMUNITY_TYPE;

  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public is_global: TRUE_FALSE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public latitude: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public longitude: string;
}
