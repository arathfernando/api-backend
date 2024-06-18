import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePromptTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public name: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  variable_names: string[];
}

export class UpdatePromptTypeDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public name: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  variable_names: string[];
}
