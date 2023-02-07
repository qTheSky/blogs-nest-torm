import { Types } from 'mongoose';
import { IsBoolean, IsMongoId, IsString, MinLength } from 'class-validator';

export class BanUserForBlogModel {
  @IsBoolean()
  isBanned: boolean;
  @MinLength(20)
  @IsString()
  banReason: string;
  @IsMongoId()
  blogId: Types.ObjectId;
}
