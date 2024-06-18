import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BasicTypeCategoryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Display name not provided' })
  public display_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description not provided' })
  public description: string;

  // @ApiProperty({
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // public parent_category: number;

  // @IsEnum(TRUE_FALSE)
  // @ApiProperty({
  //   enum: TRUE_FALSE,
  //   required: false,
  // })
  // @IsOptional()
  // public include_image: TRUE_FALSE;
}
