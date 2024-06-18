import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ContestPrizeDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public name: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public amount: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public currency: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public royalty: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public description: string;
}
