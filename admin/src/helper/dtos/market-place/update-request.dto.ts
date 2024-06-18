import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRequestDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public attachment: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    description: 'description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    description: 'message',
    required: false,
  })
  @IsString()
  message: string;

  @ApiProperty({
    type: 'string',
    description: 'budget for service',
    required: false,
  })
  @IsOptional()
  @IsString()
  budget_for_service: string;

  @ApiProperty({
    type: 'int',
    description: 'gig package id',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  gig_package_id: number;
}
