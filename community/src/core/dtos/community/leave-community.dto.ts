import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class LeaveCommunityDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public reason: string;
}
