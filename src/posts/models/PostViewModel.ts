import { ObjectId } from 'mongodb';
import { LikeStatuses, NewestLikes } from '../../common/like.types';

export type PostViewModel = {
  id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatuses;
    newestLikes: NewestLikes[];
  };
};
