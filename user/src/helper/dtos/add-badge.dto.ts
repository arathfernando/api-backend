import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { TRUE_FALSE } from '../constant';

export class AddBadgeDto {
  @ApiProperty()
  @IsNumber()
  public badge: number;

  @ApiProperty()
  @IsNumber()
  public user_id: number;

  @ApiProperty()
  @IsString()
  public post_description: string;

  @ApiProperty({
    enum: TRUE_FALSE,
  })
  @IsEnum(TRUE_FALSE)
  public need_to_post: TRUE_FALSE;
}
