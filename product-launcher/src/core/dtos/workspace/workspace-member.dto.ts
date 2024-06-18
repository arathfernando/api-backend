import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CANVAS_MEMBER_STATUS } from 'src/core/constant/enum.constant';

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
export class UpdateWorkspaceMemberDTO {
  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  workspace_id: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  user_id: string[];

  @ApiProperty({
    required: false,
    enum: CANVAS_MEMBER_STATUS,
  })
  @IsOptional()
  @IsEnum(CANVAS_MEMBER_STATUS)
  @IsNotEmpty({ message: 'workspace member status is not provided.' })
  status: CANVAS_MEMBER_STATUS;
}
