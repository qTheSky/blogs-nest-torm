import { LikePost } from '../../blogs/posts/likes/LikePost.entity';
import { LikeComment } from '../../blogs/posts/comments/likes/likeComment.entity';

export const likesMapper = (likes: LikePost[] | LikeComment[]): { likesCount: number; dislikesCount: number } => {
  let likesCount = 0;
  let dislikesCount = 0;
  for (let i = 0; i < likes.length; i++) {
    if (likes[i].status === 'Like') likesCount++;
    if (likes[i].status === 'Dislike') dislikesCount++;
  }
  return { likesCount, dislikesCount };
};
