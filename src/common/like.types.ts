import { Types } from 'mongoose';
import { IsIn } from 'class-validator';

const allowLikeStatuses: LikeStatuses[] = ['Like', 'Dislike', 'None'];
export type LikeStatuses = 'Like' | 'Dislike' | 'None';
export type LikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
};
export type NewestLikes = {
  addedAt: Date;
  userId: Types.ObjectId;
  login: string;
};

export class LikeModel {
  @IsIn(allowLikeStatuses)
  likeStatus: LikeStatuses;
}
