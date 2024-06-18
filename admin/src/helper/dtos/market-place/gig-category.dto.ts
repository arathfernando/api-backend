import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateGigCategoryDto {
  @ApiProperty({
    example: 'Category name',
    description: 'The name of the Gig Category',
  })
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public cover: Express.Multer.File;

  @ApiProperty({
    example: 'Description',
    description: 'The description of the Gig Category',
  })
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  public created_by: number;
}
