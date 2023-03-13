import { CommentViewModel } from '../../../../blogs/posts/comments/models/CommentViewModel';

export const commentViewModelExample: CommentViewModel = {
  id: 'string',
  content: 'string',
  commentatorInfo: { userId: 'string', userLogin: 'string' },
  createdAt: '2023-03-13T12:42:19.885Z',
  likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
};
