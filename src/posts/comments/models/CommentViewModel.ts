import { LikesInfoViewModel } from '../../../common/like.types';
import { Types } from 'mongoose';

export interface CommentViewModel {
  id: Types.ObjectId;
  content: string;
  commentatorInfo: {
    userId: Types.ObjectId;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfoViewModel;
}

export interface CommentForBloggerViewModel extends CommentViewModel {
  postInfo: {
    id: Types.ObjectId;
    title: string;
    blogId: Types.ObjectId;
    blogName: string;
  };
}
