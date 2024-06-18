import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HubbersTeamProfileDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public avatar: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No First Name provided' })
  public first_name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No Last Name provided' })
  public last_name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No Title provided' })
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public description: string;
}

export class UpdateHubbersTeamProfileDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public avatar: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No First Name provided' })
  public first_name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No Last Name provided' })
  public last_name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No Title provided' })
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public description: string;
}
