import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateZoneDTO {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  area_name: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  subarea_name: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  created_at_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  community_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  created_by: number;
}
