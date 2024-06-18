import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { GROUP_USER_ROLE } from 'src/core/constant/enum.constant';
import { InvitedUserDto } from './invited-user.dto';

export class InviteUsersToGroupDto {
  @ApiProperty({
    required: true,
    type: InvitedUserDto,
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty({ message: 'No name is provided' })
  public users: InvitedUserDto[];

  @ApiProperty({
    required: true,
    enum: GROUP_USER_ROLE,
  })
  @IsEnum(GROUP_USER_ROLE)
  @IsNotEmpty({ message: 'Role is not provided' })
  public group_role: GROUP_USER_ROLE;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public message: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Community is not provided' })
  public group_id: number;
}
