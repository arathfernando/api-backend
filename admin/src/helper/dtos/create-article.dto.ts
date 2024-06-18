import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAdminArticleDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'article title is not provided' })
  public article_title: string;
  @ApiProperty({
    required: true,
  })
  @IsString()
  public article_description: string;
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public image: Express.Multer.File;
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public created_by: number;
}

export class UpdateAdminArticleDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public article_title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public article_description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public image: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public created_by: number;
}
