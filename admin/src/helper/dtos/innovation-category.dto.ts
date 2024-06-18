import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InnovationCategoryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description not provided' })
  public description: string;
}

export class UpdateInnovationCategoryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description not provided' })
  public description: string;
}
