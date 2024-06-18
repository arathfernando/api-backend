import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InvitedUserDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Email is not provided' })
  public email: string;

  // @ApiProperty({
  //   required: true,
  //   enum: INVITATION_TYPE,
  // })
  // @IsEnum(INVITATION_TYPE)
  // @IsNotEmpty({ message: 'Invitation type is not provided' })
  // public invitation_type: INVITATION_TYPE;
}
