import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModel } from './comment.schema';
import { NormalizedCommentsQuery } from '../../common/query-normalizer';
import { PaginatorResponseType } from '../../common/paginator-response-type';
import { Types } from 'mongoose';

export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModel) {}

  async findComments(
    query: NormalizedCommentsQuery,
    querySettings: {
      forPostId?: Types.ObjectId;
      forBloggerId?: Types.ObjectId;
    },
  ): Promise<PaginatorResponseType<Comment[]>> {
    const filter: any = {
      isUserBanned: { $ne: true },
    };

    if (querySettings.forPostId) {
      filter.postId = querySettings.forPostId;
    }

    if (querySettings.forBloggerId) {
      filter.blogOwnerId = querySettings.forBloggerId;
    }

    const sort: any = {
      [query.sortBy]: query.sortDirection === 'desc' ? -1 : 1,
    };

    const totalCount = await this.CommentModel.countDocuments(filter);
    const paginationInfo = {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
    };
    const comments = await this.CommentModel.find(filter)
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .sort(sort)
      .lean();
    return { ...paginationInfo, items: comments };
  }
}
