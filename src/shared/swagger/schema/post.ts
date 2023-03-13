import { PostViewModel } from '../../../blogs/posts/models/PostViewModel';
import { isoDateExample } from './common/iso-date-example';

export const postViewModelExample: PostViewModel = {
  id: 'string',
  title: 'string',
  shortDescription: 'string',
  content: 'string',
  blogId: 'string',
  blogName: 'string',
  createdAt: isoDateExample,
  extendedLikesInfo: {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: 'None',
    newestLikes: [{ addedAt: isoDateExample, userId: 'string', login: 'string' }],
  },
  images: {
    main: [{ url: 'string', width: 0, height: 0, fileSize: 0 }],
  },
};
