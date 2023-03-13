import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostModel {
  @Length(1, 30)
  @ApiProperty({ example: 'string', minLength: 1, maxLength: 30 })
  title: string;
  @Length(1, 100)
  @ApiProperty({ example: 'string', minLength: 1, maxLength: 100 })
  shortDescription: string;
  @Length(1, 1000)
  @ApiProperty({ example: 'string', minLength: 1, maxLength: 1000 })
  content: string;
}
