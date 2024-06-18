import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePromptDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'prompt type is not provided' })
  public prompt_type: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public prompt_text: string;
}
export class UpdatePromptDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'prompt type is not provided' })
  public prompt_type: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public prompt_text: string;
}
