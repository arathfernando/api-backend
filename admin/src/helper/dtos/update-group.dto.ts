import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { GROUP_PRIVACY, GROUP_STATUS, GROUP_TYPE } from '../constant';

export class UpdateCommunityGroupDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public community_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public group_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    enum: GROUP_PRIVACY,
    required: false,
  })
  @IsOptional()
  @IsEnum(GROUP_PRIVACY)
  public privacy: GROUP_PRIVACY;

  @ApiProperty({
    enum: GROUP_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(GROUP_TYPE)
  public group_type: GROUP_TYPE;

  @ApiProperty({
    enum: GROUP_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(GROUP_STATUS)
  public status: GROUP_STATUS;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public invited_members: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public cover_page: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public created_by: number;
}
