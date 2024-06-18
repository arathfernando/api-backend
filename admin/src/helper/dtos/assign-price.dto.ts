import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAssignPriceDTO {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  zone: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  price_share: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  from_which_date: string;
}

export class UpdateAssignPriceDTO {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  price_share: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  from_which_date: string;
}
