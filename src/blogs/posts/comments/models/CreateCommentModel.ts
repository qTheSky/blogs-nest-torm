import { Length } from 'class-validator';

export class CreateCommentModel {
  @Length(20, 300)
  content: string;
}
