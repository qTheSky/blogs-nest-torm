import { IsArray, IsString, Length } from 'class-validator';

export class UpdateQuizQuestionModel {
  @IsString()
  @Length(0, 1000)
  body: string;
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];
}
