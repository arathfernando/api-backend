import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TimelineFiltersDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public filter: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public lat: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public long: string;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
