import { CommentForBloggerViewModel } from '../../../../blogs/posts/comments/models/CommentViewModel';
import { isoDateExample } from '../common/iso-date-example';

export const commentForBlogExample: CommentForBloggerViewModel = {
  id: 'string',
  content: 'string',
  commentatorInfo: { userId: 'string', userLogin: 'string' },
  createdAt: isoDateExample,
  postInfo: { id: 'string', title: 'string', blogId: 'string', blogName: 'string' },
  likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
};
