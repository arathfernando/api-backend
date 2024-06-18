import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public attachment: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    description: 'description',
    required: false,
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    description: 'budget for service',
    required: false,
  })
  @IsString()
  budget_for_service: string;

  @ApiProperty({
    type: 'int',
    description: 'gig package id',
    required: false,
  })
  @IsNumber()
  gig_package_id: number;
}
