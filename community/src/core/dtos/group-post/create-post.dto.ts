import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Group id is not provided' })
  public group_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public content: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
    required: true,
  })
  public attachments: any[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;
}
