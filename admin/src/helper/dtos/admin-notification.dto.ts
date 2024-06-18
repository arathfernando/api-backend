import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No notification title provided' })
  public notification_title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No notification content provided' })
  public notification_content: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No notification type provided' })
  public notification_type: string;
}

export class UpdateAdminNotificationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'No notification title provided' })
  public notification_title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'No notification content provided' })
  public notification_content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'No notification type provided' })
  public notification_type: string;
}
