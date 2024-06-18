import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public role_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public permission: string;
}

export class UpdateAdminRoleDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public role_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public permission: string;
}
