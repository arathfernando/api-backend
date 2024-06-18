import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateWorkspaceCardTypeDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({ message: 'id is not provided' })
  public workspace_category_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'No order provided' })
  public order: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({ message: 'description is not provided' })
  public description: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({ message: 'title is not provided' })
  public title: string;
}

export class UpdateWorkspaceCardTypeDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'id is not provided' })
  public workspace_category_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'No order provided' })
  public order: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'description is not provided' })
  public description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'title is not provided' })
  public title: string;
}
