import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const allowLikeStatuses: LikeStatuses[] = ['Like', 'Dislike', 'None'];
export type LikeStatuses = 'Like' | 'Dislike' | 'None';
export type LikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
};
export type NewestLikes = {
  addedAt: string;
  userId: string;
  login: string;
};
export enum LikeStatusesEnum {
  LIKE = 'Like',
  DISLIKE = 'Dislike',
  NONE = 'None',
}
export class LikeModel {
  @IsIn(allowLikeStatuses)
  @ApiProperty({ description: 'Send None if you want to unlike\\undislike', enum: LikeStatusesEnum })
  likeStatus: LikeStatuses;
}
