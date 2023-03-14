import { IsArray, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizQuestionModel {
  @IsString()
  @Length(10, 500)
  @ApiProperty({ type: String, minLength: 10, maxLength: 500 })
  body: string;
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: String, isArray: true, example: ['example1', 'example2'] })
  correctAnswers: string[];
}
