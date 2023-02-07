import { IsUrl, Length } from 'class-validator';

export class CreateBlogModel {
  @Length(1, 15)
  name: string;
  @Length(1, 500)
  description: string;
  @Length(1, 100)
  @IsUrl()
  websiteUrl: string;
}
