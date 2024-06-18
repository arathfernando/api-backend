import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GROUP_PRIVACY, GROUP_TYPE } from '../constant';

export class CreateCommunityGroupDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public community_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Group name is not provided' })
  public group_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Description is not provided' })
  public description: string;

  @IsEnum(GROUP_PRIVACY)
  @ApiProperty({
    enum: GROUP_PRIVACY,
    required: true,
  })
  public privacy: GROUP_PRIVACY;

  @IsEnum(GROUP_TYPE)
  @ApiProperty({
    enum: GROUP_TYPE,
    required: true,
  })
  public group_type: GROUP_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public invited_members: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public cover_page: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public created_by: number;
}
