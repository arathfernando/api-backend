import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  POST_LOCATION,
  POST_SHARE_TYPE,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';

export class CreatePostDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Community/Group id is not provided' })
  public id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public content: string;

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

  @ApiProperty({
    enum: TRUE_FALSE,
    required: true,
  })
  @IsEnum(TRUE_FALSE)
  public is_share: TRUE_FALSE;

  @ApiProperty({
    enum: POST_SHARE_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(POST_SHARE_TYPE)
  public post_share_type: POST_SHARE_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public share_id: number;
}
