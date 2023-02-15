import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatorResponseType } from '../../../common/paginator-response-type';
import { NormalizedCommentsQuery } from '../../../common/query-normalizer';
import { cutLikesByBannedUsers } from '../utils/cut-likes-by-banned-users';
import { LikeComment } from './likes/likeComment.entity';

export class CommentsQueryRepo {
  constructor(@InjectRepository(Comment) private readonly repo: Repository<Comment>) {}

  async findComments(
    query: NormalizedCommentsQuery,
    querySettings: { forPostId?: number; commentsOnlyForBlogOfUserId?: number },
  ): Promise<PaginatorResponseType<Comment[]>> {
    const filter: FindOptionsWhere<Comment> = { user: { banInfo: { isBanned: false } } };

    if (querySettings.forPostId) {
      filter.postId = querySettings.forPostId;
    }
    if (querySettings.commentsOnlyForBlogOfUserId) {
      filter.post = { blog: { userId: querySettings.commentsOnlyForBlogOfUserId } };
    }

    const [foundComments, total] = await this.repo.findAndCount({
      where: filter,
      skip: (query.pageNumber - 1) * query.pageSize,
      take: query.pageSize,
    });
    let comments;
    if (foundComments.length > 0) {
      comments = foundComments.map((p) => ({
        ...p,
        likes: cutLikesByBannedUsers<LikeComment>(p.likes),
      }));
    }

    return {
      pagesCount: Math.ceil(total / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: total,
      // items: comments ?? [],
      items: comments ? comments : [],
    };
  }
}
