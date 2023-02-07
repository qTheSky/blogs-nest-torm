import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from './blog.schema';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { NormalizedBlogsQuery } from '../common/query-normalizer';
import { Types } from 'mongoose';

export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModel) {}

  async findBlogs(
    query: NormalizedBlogsQuery,
    settings: { blogsOfSpecifiedUserId?: Types.ObjectId; isAdminRequesting?: boolean } = {
      blogsOfSpecifiedUserId: undefined,
      isAdminRequesting: false,
    },
  ): Promise<PaginatorResponseType<Blog[]>> {
    const filter: any = {
      'banInfo.isBanned': { $ne: true },
    };
    if (settings.isAdminRequesting) {
      delete filter['banInfo.isBanned'];
    }

    const sort: any = {
      [query.sortBy]: query.sortDirection === 'desc' ? -1 : 1,
    };

    if (query.searchNameTerm) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }

    if (settings.blogsOfSpecifiedUserId) {
      filter.userId = settings.blogsOfSpecifiedUserId;
    }

    const totalCount = await this.BlogModel.countDocuments(filter);
    const paginationInfo = {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
    };

    const blogs = await this.BlogModel.find(filter)
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .sort(sort)
      .lean();
    return { ...paginationInfo, items: blogs };
  }
}
