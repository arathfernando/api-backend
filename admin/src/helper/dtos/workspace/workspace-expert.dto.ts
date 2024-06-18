import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export enum INVITE_STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class WorkspaceExpertDTO {
  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  workspace_id: number;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  gig_id: number;

  @ApiProperty({
    required: true,
    enum: INVITE_STATUS,
  })
  @IsEnum(INVITE_STATUS)
  @IsNotEmpty({ message: 'workspace member invite status is not provided.' })
  invite_status: INVITE_STATUS;
}
export class UpdateWorkspaceExpertDTO {
  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  workspace_id: number;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  gig_id: number;

  @ApiProperty({
    required: false,
    enum: INVITE_STATUS,
  })
  @IsOptional()
  @IsEnum(INVITE_STATUS)
  @IsNotEmpty({ message: 'workspace member status is not provided.' })
  invite_status: INVITE_STATUS;
}
