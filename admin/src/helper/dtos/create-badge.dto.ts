import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBadgeDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Badge name is not provided' })
  public badge_name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Badge category is not provided' })
  public badge_category: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public badge_image: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public level: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public hbb_points: string;
}
