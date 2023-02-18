import { IsBoolean } from 'class-validator';

export class PublishQuestionModel {
  @IsBoolean()
  published: boolean;
}
