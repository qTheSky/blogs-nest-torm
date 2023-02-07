import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModel } from './post.schema';
import { NormalizedPostsQuery } from '../common/query-normalizer';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { Types } from 'mongoose';

export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModel) {}

  async findPosts(query: NormalizedPostsQuery, blogId?: Types.ObjectId): Promise<PaginatorResponseType<Post[]>> {
    const filter: any = {
      isUserBanned: { $ne: true },
      isBlogBanned: { $ne: true },
    };
    const sort: any = {
      [query.sortBy]: query.sortDirection === 'desc' ? -1 : 1,
    };

    if (blogId) {
      filter.blogId = blogId;
    }
    const totalCount = await this.PostModel.countDocuments(filter);
    const paginationInfo = {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
    };
    const posts = await this.PostModel.find(filter)
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .sort(sort)
      .lean();
    return { ...paginationInfo, items: posts };
  }
}
