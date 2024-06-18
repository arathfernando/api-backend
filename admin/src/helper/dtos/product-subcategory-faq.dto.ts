import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
export class ProductSubCategoryfaqDto {
  @ApiProperty()
  @IsNumber()
  product_subcategory_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  percentage: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  question: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  default_answer: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  answer: string[];
}
