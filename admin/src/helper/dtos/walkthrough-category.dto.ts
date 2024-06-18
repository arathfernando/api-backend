import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateWalkthroughCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Category name not provided' })
  public category_name: string;

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  public step: string[];
}
