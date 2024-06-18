import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceDTO {
  @ApiProperty({ type: 'string' })
  @IsString()
  name: string;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  workspace_type: number;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  project_id: number;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  public workspace_member: string[];
}

export class UpdateWorkspaceDTO {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  workspace_type: number;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  project_id: number;
}
