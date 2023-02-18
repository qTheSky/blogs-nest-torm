import { IsArray, IsString } from 'class-validator';

export class UpdateQuizQuestionModel {
  @IsString()
  body: string;
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];
}
