import { IsUrl, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogModel {
  @Length(1, 15)
  @ApiProperty({ example: 'string', minLength: 1, maxLength: 15 })
  name: string;
  @Length(1, 500)
  @ApiProperty({ example: 'string', minLength: 1, maxLength: 500 })
  description: string;
  @Length(1, 100)
  @IsUrl()
  @ApiProperty({ example: 'https://github.com', minLength: 1, maxLength: 100 })
  websiteUrl: string;
}
