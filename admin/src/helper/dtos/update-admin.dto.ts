import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ADMIN_ROLES, TRUE_FALSE } from '../constant';

export class UpdateAdminUserDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public first_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public last_name: string;

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
  @IsString()
  public country_code: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public mobile_number: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public password: string;

  @ApiProperty({
    required: false,
    enum: ADMIN_ROLES,
  })
  @IsOptional()
  @IsEnum(ADMIN_ROLES)
  public role: ADMIN_ROLES;

  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public has_new_notification: TRUE_FALSE;

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
  })
  @IsOptional()
  admin_role: number[];

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public profile_image: Express.Multer.File;
}
