import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GROUP_PRIVACY, GROUP_TYPE } from 'src/core/constant/enum.constant';

export class UpdateCommunityGroupDto {
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
    required: false,
  })
  @IsOptional()
  @IsString()
  feedback: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  reason_of_the_rejection: string;

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
  public topics: string;
}
