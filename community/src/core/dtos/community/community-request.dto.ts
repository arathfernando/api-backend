import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  COMMUNITY_REQUEST_STATUS,
  COMMUNITY_REQUEST_TYPE,
} from 'src/core/constant/enum.constant';

export class CommunityRequestDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'No search is provided' })
  public search: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Community is not provided' })
  public community_id: number;

  @ApiProperty({
    required: false,
    enum: COMMUNITY_REQUEST_STATUS,
  })
  @IsOptional()
  @IsEnum(COMMUNITY_REQUEST_STATUS)
  @IsNotEmpty({ message: 'Role is not provided' })
  public request_status: COMMUNITY_REQUEST_STATUS;

  @ApiProperty({
    required: false,
    enum: COMMUNITY_REQUEST_TYPE,
  })
  @IsOptional()
  @IsEnum(COMMUNITY_REQUEST_TYPE)
  @IsNotEmpty({ message: 'type is not provided' })
  public request_type: COMMUNITY_REQUEST_TYPE;
}
