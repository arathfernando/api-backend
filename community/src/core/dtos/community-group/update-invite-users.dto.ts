import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { GROUP_USER_ROLE } from 'src/core/constant/enum.constant';

export class UpdateInviteUsersToGroupDto {
  @ApiProperty({
    required: true,
    enum: GROUP_USER_ROLE,
  })
  @IsEnum(GROUP_USER_ROLE)
  @IsNotEmpty({ message: 'Role is not provided' })
  public group_role: GROUP_USER_ROLE;
}
