import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerInputModel {
  @IsString()
  @ApiProperty({ example: 'string', type: 'string' })
  answer: string;
}
