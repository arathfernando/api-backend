import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

class Interest {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public type_category: number;

  @ApiProperty({
    required: true,
    isArray: true,
  })
  @IsArray()
  public interests: number[];
}
export class UpdateUserInterestDto {
  @ApiProperty({
    required: true,
    type: Interest,
    isArray: true,
  })
  @IsArray()
  public interests: Interest[];
}
