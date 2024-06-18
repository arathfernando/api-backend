import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SHARED_CONTENT_TYPE } from 'src/core/constant/enum.constant';

export class SharePostDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Community id is not provided' })
  public community_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public content: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public shared_content_id: number;

  @ApiProperty({
    enum: SHARED_CONTENT_TYPE,
    required: true,
  })
  @IsEnum(SHARED_CONTENT_TYPE)
  public shared_content_type: SHARED_CONTENT_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;
}
