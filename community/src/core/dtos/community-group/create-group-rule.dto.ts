import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { GroupRuleDto } from './group-rule.dto';

export class CreateGroupRuleDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: GroupRuleDto,
  })
  @IsArray()
  public rules: GroupRuleDto[];

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public group_id: number;
}
