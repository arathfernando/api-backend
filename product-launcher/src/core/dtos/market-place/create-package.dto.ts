import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GIG_ACCEPT_PAYMENT } from 'src/core/constant/enum.constant';

export class CreatePackageDto {
  @ApiProperty({
    example: GIG_ACCEPT_PAYMENT.BANK_TRANSFER,
    enum: GIG_ACCEPT_PAYMENT,
  })
  @IsEnum(GIG_ACCEPT_PAYMENT, { message: 'Invalid how_get_paid value' })
  @IsNotEmpty({ message: 'how_get_paid cannot be empty' })
  how_get_paid: GIG_ACCEPT_PAYMENT;

  @ApiProperty({
    example: 'Basic package',
    type: String,
  })
  @IsString({ message: 'Package title must be a string' })
  @IsNotEmpty({ message: 'Package title cannot be empty' })
  package_title: string;

  @ApiProperty({
    example: 'This is a basic package',
    type: String,
  })
  @IsString({ message: 'Package description must be a string' })
  @IsNotEmpty({ message: 'Package description cannot be empty' })
  description: string;

  @ApiProperty({
    example: '2022-03-01',
    type: Date,
  })
  @IsString({ message: 'Available from date must be a string' })
  @IsNotEmpty({ message: 'Available from date cannot be empty' })
  available_from: Date;

  @ApiProperty({
    example: '2022-03-31',
    type: Date,
  })
  @IsString({ message: 'Available to date must be a string' })
  @IsNotEmpty({ message: 'Available to date cannot be empty' })
  available_to: Date;

  @ApiProperty({
    example: 100,
    type: Number,
  })
  @IsNotEmpty({ message: 'Package price cannot be empty' })
  package_price: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'Gig id cannot be empty' })
  gig_id: number;
}
