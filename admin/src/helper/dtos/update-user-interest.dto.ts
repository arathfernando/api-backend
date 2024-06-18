import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

class Interest {
  // @ApiProperty()
  // @IsNumber()
  // @IsNotEmpty({ message: 'Please provide User id' })
  // public general_profile_id: number;

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
  public interests: Interest;
}
