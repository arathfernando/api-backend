import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGigCategoryDto {
  @ApiProperty({
    required: false,
    example: 'Category name',
    description: 'The name of the Gig Category',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: 'Description',
    description: 'The description of the Gig Category',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public cover: Express.Multer.File;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public created_by: number;
}
