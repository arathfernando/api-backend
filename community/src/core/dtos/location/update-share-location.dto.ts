import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { POST_LOCATION } from 'src/core/constant/enum.constant';

export class UpdateShareLocationDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public content: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public location: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;

  @ApiProperty({
    enum: POST_LOCATION,
    required: true,
  })
  @IsEnum(POST_LOCATION)
  public post_location: POST_LOCATION;
}
