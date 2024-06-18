import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
export class CreatePartnerContactUsDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public partner_id: number;

  @ApiProperty({ required: true })
  @IsString()
  public first_name: string;

  @ApiProperty({ required: true })
  @IsString()
  public last_name: string;

  @ApiProperty({ required: true })
  @IsString()
  public email: string;

  @ApiProperty({ required: true })
  @IsString()
  public subject: string;

  @ApiProperty({ required: true })
  @IsString()
  public message: string;
}

export class UpdatePartnerContactUsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  public partner_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public first_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public last_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public subject: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public message: string;
}
