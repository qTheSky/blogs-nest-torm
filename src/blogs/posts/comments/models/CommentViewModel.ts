import { LikesInfoViewModel } from '../../../../shared/like.types';

export interface CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfoViewModel;
}

export interface CommentForBloggerViewModel extends CommentViewModel {
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
}
