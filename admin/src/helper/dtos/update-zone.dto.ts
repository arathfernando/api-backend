import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateZoneDTO {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  area_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  created_at_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  community_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  subarea_name: string;
}
