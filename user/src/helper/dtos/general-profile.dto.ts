import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGeneralProfileDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public avatar: Express.Multer.File;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public location: string;

  @ApiProperty()
  @IsString()
  public latitude: string;

  @ApiProperty()
  @IsString()
  public longitude: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public nationality: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public birth_date: string;
}

export class UpdateGeneralProfileDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public avatar: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public first_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public last_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public location: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public latitude: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public longitude: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public nationality: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public birth_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public bio?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public role?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public experience_in_role?: string;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  walkthrough_category: number[];
}
