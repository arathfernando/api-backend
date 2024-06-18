import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Goal Title not provided' })
  public goal_title: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public goal_image: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Color is not provided' })
  public color: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public goal_number: number;
}
