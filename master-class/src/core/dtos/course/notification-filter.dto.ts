import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DATE_FILTER } from 'src/core/constant/enum.constant';

export class NotificationFilterDataDto {
  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  public course_id: number;

  @ApiProperty({
    required: true,
    enum: DATE_FILTER,
  })
  @IsEnum(DATE_FILTER)
  public date_filter: DATE_FILTER;
}
