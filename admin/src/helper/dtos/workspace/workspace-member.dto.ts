import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export enum CANVAS_MEMBER_TYPE {
  MEMBER = 'MEMBER',
  EXPERT = 'EXPERT',
}
export enum CANVAS_MEMBER_STATUS {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}
export class CreateWorkspaceMemberDTO {
  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  workspace_id: number;

  @ApiProperty({
    type: [String],
  })
  @IsArray()
  public user_id: string[];

  @ApiProperty({
    required: true,
    enum: CANVAS_MEMBER_STATUS,
  })
  @IsEnum(CANVAS_MEMBER_STATUS)
  @IsNotEmpty({ message: 'workspace member status is not provided.' })
  status: CANVAS_MEMBER_STATUS;
}
