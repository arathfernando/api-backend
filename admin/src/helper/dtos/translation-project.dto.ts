import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTranslationProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public project_name: string;
}

export class UpdateTranslationProjectDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public project_name: string;
}
