import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CONTESTANT_ROLE } from 'src/helper/constant/enums.constant';

export class AddContestant {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Contest is not provided' })
  public contest_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'User is not provided' })
  public email: string;

  @ApiProperty({
    required: true,
    enum: CONTESTANT_ROLE,
  })
  @IsEnum(CONTESTANT_ROLE)
  @IsNotEmpty({ message: 'Contestant Role is not provided.' })
  role: CONTESTANT_ROLE;
}
