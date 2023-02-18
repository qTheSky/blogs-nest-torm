import { IsArray, IsString } from 'class-validator';

export class CreateQuizQuestionModel {
  @IsString()
  body: string;
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];
}
