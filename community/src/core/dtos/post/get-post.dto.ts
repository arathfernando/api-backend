import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { POST_LOCATION, POST_STATUS } from 'src/core/constant/enum.constant';

export class GetPostDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Community/Group id is not provided' })
  public id: number;

  @ApiProperty({
    enum: POST_LOCATION,
    required: true,
  })
  @IsEnum(POST_LOCATION)
  public post_location: POST_LOCATION;

  @IsEnum(POST_STATUS)
  @ApiProperty({
    enum: POST_STATUS,
    required: true,
  })
  public post_status: POST_STATUS;
}
