import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommunityMaxRangeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No latitude is provided' })
  public latitude: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No longitude is provided' })
  public longitude: string;
}
