import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductSubCategoryDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  public product_category_id: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  cover: Express.Multer.File;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description not provided' })
  public description: string;
}
export class UpdateProductSubCategoryDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  public product_category_id: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  cover: Express.Multer.File;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description not provided' })
  public description: string;
}
