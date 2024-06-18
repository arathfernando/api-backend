import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EventSpeakerDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Event id not provided' })
  event_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Name is not provided' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Role is not provided' })
  role: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Bio is not provided' })
  bio: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public cover: Express.Multer.File;
}

export class UpdateEventSpeakerDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'id not provided' })
  id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'Event id not provided' })
  event_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name is not provided' })
  name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Role is not provided' })
  role: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Bio is not provided' })
  bio: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public cover: Express.Multer.File;
}
