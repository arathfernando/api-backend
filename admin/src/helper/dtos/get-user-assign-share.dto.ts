import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ASSIGN_SHARE_FILTER } from '../constant';

export class GetUserAssignShareDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Search is not provided' })
  public search: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(ASSIGN_SHARE_FILTER)
  filter: ASSIGN_SHARE_FILTER;
}
