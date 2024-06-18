import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { PROFILE_TYPES, STATUS, TRUE_FALSE } from '../constant';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEmail()
  public email: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public password: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  public profile_types: string[];

  @ApiProperty({
    required: false,
    enum: STATUS,
  })
  @IsOptional()
  @IsEnum(STATUS)
  public status: STATUS;

  @ApiProperty({
    required: false,
    enum: PROFILE_TYPES,
  })
  @IsOptional()
  @IsEnum(PROFILE_TYPES)
  public role: PROFILE_TYPES;

  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public is_hubber_team: TRUE_FALSE;

  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public is_verified_id_by_code: TRUE_FALSE;

  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public is_completed_three_step_process: TRUE_FALSE;

  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public has_new_notification: TRUE_FALSE;

  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public has_new_message: TRUE_FALSE;
}
