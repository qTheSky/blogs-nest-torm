import { IsBoolean, IsString, MinLength } from 'class-validator';

export class BanUserForBlogModel {
  @IsBoolean()
  isBanned: boolean;
  @MinLength(20)
  @IsString()
  banReason: string;
  @IsString()
  blogId: string;
}
