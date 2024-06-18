import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { EVENT_TYPE } from 'src/core/constant/enum.constant';

export class SearchDataQueryEventDto {
  @ApiProperty({
    enum: EVENT_TYPE,
    required: false,
  })
  @IsOptional()
  public event_type: EVENT_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public community_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Search is not provided' })
  public search: string;
}
