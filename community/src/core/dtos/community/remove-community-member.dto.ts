import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class RemoveCommunityMemberDto {
  @ApiProperty({
    required: true,
  })
  @IsArray()
  public id: [];

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public community_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public reason: string;
}
