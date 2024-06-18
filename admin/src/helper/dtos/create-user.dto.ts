import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { PROFILE_TYPES, TRUE_FALSE } from '../constant';

export class UserCreateDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is not provided' })
  public first_name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is not provided' })
  public last_name: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  public profile_types: string[];

  @ApiProperty({
    required: true,
  })
  @IsEmail()
  @IsNotEmpty({ message: 'No email provided' })
  public email: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No password provided' })
  public password: string;

  @ApiProperty({
    required: true,
    enum: PROFILE_TYPES,
  })
  @IsEnum(PROFILE_TYPES)
  public role: PROFILE_TYPES;

  @ApiProperty({
    required: true,
    enum: TRUE_FALSE,
  })
  @IsEnum(TRUE_FALSE)
  public is_hubber_team: TRUE_FALSE;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public avatar: Express.Multer.File;
}
