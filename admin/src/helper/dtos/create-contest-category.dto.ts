import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContestCategoryDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title not provided' })
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'prompts_text not provided' })
  public prompts_text: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public image: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is not provided' })
  public description: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public contest_standard_rule: string;
}
