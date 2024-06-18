import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GIG_ACCEPT_PAYMENT } from 'src/core/constant/enum.constant';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePackageDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  gig_id: number;

  @IsOptional()
  @ApiProperty({
    example: GIG_ACCEPT_PAYMENT.BANK_TRANSFER,
    description: 'Method of payment',
    enum: GIG_ACCEPT_PAYMENT,
    required: false,
  })
  @IsEnum(GIG_ACCEPT_PAYMENT, {
    message:
      'How to get paid should be one of these: "paypal", "bank_transfer", "HBB"',
  })
  how_get_paid?: GIG_ACCEPT_PAYMENT;

  @IsOptional()
  @ApiProperty({
    example: '5 days delivery',
    description: 'Title of the package',
    required: false,
  })
  @IsNotEmpty({ message: 'Package title should not be empty' })
  @IsString({ message: 'Package title should be a string' })
  package_title?: string;

  @IsOptional()
  @ApiProperty({
    example: 'I will do your task within 5 days',
    description: 'Description of the package',
    required: false,
  })
  @IsOptional()
  description?: string;

  @IsOptional()
  @ApiProperty({
    example: '2022-01-01',
    description: 'Available from date',
    required: false,
  })
  @IsNotEmpty({ message: 'Available from date should not be empty' })
  @IsDate({ message: 'Available from date should be a valid date' })
  available_from?: Date;

  @IsOptional()
  @ApiProperty({
    example: '2022-01-10',
    description: 'Available to date',
    required: false,
  })
  @IsNotEmpty({ message: 'Available to date should not be empty' })
  @IsDate({ message: 'Available to date should be a valid date' })
  available_to?: Date;

  @IsOptional()
  @ApiProperty({
    example: 50,
    description: 'Price of the package',
    required: false,
  })
  @IsNotEmpty({ message: 'Package price should not be empty' })
  @IsNumber({}, { message: 'Package price should be a number' })
  package_price?: number;
}
