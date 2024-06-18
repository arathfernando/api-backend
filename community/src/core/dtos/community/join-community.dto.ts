import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class JoinCommunityDto {
  @ApiProperty({
    required: true,
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty({ message: 'No name is provided' })
  public communities: number[];
}
