import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GroupRuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Rule is not provided' })
  public rule: string;
}

export class UpdateRuleDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public rule: string;
}
