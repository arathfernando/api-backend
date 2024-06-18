import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

enum CONTEST_STATE {
  ALL = 'ALL',
  COMPLETED = 'COMPLETED',
  DRAFTED = 'DRAFTED',
  ONGOING = 'ONGOING',
  PENDING = 'PENDING',
}
enum CONTEST_ROLE {
  ALL = 'ALL',
  ORGANIZER = 'ORGANIZER',
  JUDGE = 'JUDGE',
  CONTESTANT = 'CONTESTANT',
}
export class GetContestByState {
  @IsEnum(CONTEST_STATE)
  @ApiProperty({
    enum: CONTEST_STATE,
    required: true,
  })
  public state: CONTEST_STATE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  created_by: number;

  @IsEnum(CONTEST_ROLE)
  @ApiProperty({
    enum: CONTEST_ROLE,
  })
  public contest_role: CONTEST_ROLE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'No name is provided' })
  public name: string;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
