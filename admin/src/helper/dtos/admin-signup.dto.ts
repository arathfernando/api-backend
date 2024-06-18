import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateAdminUserSignUpDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({ message: 'No email provided' })
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No password provided' })
  public password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No mobile number provided' })
  public mobile_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No Country code provided' })
  public country_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No First Name provided' })
  public first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No Last Name provided' })
  public last_name: string;
}
