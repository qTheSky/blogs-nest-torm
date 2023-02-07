import { Length } from 'class-validator';

export class UpdateCommentModel {
  @Length(20, 300)
  content: string;
}
