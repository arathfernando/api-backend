import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceCardDTO {
  @ApiProperty({ type: 'string' })
  @IsString()
  title: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  background_color: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  description: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  public attachments: string[];

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  workspace_card_type: number;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  workspace_id: number;
}

export class UpdateWorkspaceCardDTO {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  background_color: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  public attachments: string[];

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  workspace_card_type: number;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  workspace_id: number;
}
