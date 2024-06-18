import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class InviteUsersToEventDto {
  @ApiProperty({
    required: true,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty({ message: 'Emails are not provided' })
  public users: string[];

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Community is not provided' })
  public event_id: number;
}
