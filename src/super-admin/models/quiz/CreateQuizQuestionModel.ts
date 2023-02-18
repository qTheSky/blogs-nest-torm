import { IsArray, IsString, Length } from 'class-validator';

export class CreateQuizQuestionModel {
  @IsString()
  @Length(10, 500)
  body: string;
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];
}
