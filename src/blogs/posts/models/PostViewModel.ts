import { LikeStatuses, NewestLikes } from '../../../shared/types/like.types';
import { ImageViewModel } from '../../models/ImageViewModel';

export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
  images: { main: ImageViewModel[] };
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
  newestLikes: NewestLikes[];
};
