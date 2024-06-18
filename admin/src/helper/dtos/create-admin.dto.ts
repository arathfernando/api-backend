import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateAdminUserDto {
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
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Country Code is not provided' })
  public country_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No mobile number provided' })
  public mobile_number: string;

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
    required: false,
    type: [Number],
  })
  @IsOptional()
  public admin_role: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public profile_image: Express.Multer.File;
}
