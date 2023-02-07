import { Length } from 'class-validator';

export class UpdatePostModel {
  @Length(1, 30)
  title: string;
  @Length(1, 100)
  shortDescription: string;
  @Length(1, 1000)
  content: string;
  // @IsMongoId()
  // @Validate(IsBlogExistConstraint, { message: 'Blog doesnt exist' })
  // blogId: Types.ObjectId;
}
