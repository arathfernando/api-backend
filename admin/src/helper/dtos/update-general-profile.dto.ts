import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
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
}
