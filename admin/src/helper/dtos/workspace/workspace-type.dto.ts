import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WORKSPACE_CATEGORY_LABEL } from 'src/helper/constant';

export class CreateWorkspaceTypeDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'title is not provided' })
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public short_description: string;

  @ApiProperty({
    required: false,
    enum: WORKSPACE_CATEGORY_LABEL,
  })
  @IsOptional()
  @IsEnum(WORKSPACE_CATEGORY_LABEL)
  public label: WORKSPACE_CATEGORY_LABEL;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'description is not provided' })
  public description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public icon: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public co_created_with: any;
}

export class UpdateWorkspaceTypeDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'title is not provided' })
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'description is not provided' })
  public description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'short description is not provided' })
  public short_description: string;

  @ApiProperty({
    required: false,
    enum: WORKSPACE_CATEGORY_LABEL,
  })
  @IsOptional()
  @IsEnum(WORKSPACE_CATEGORY_LABEL)
  public label: WORKSPACE_CATEGORY_LABEL;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public icon: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public co_created_with: Express.Multer.File;
}
