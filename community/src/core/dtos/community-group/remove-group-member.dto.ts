import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class RemoveGroupMemberDto {
  @ApiProperty({
    required: true,
  })
  @IsArray()
  public id: [];

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public group_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public reason: string;
}
