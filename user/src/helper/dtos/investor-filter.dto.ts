import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InvestorFilterDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Search is not provided' })
  public search: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public minDate: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public maxDate: string;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
