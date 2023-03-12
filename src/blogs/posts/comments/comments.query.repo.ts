import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatorResponseType } from '../../../shared/types/paginator-response-type';
import { cutLikesByBannedUsers } from '../utils/cut-likes-by-banned-users';
import { LikeComment } from './likes/likeComment.entity';
import { CommentsQuery } from './models/QueryCommentModel';

export class CommentsQueryRepo {
  constructor(@InjectRepository(Comment) private readonly repo: Repository<Comment>) {}

  async findComments(
    query: CommentsQuery,
    settings: { forPostId?: number; commentsOnlyForBlogsOfUserId?: number },
  ): Promise<PaginatorResponseType<Comment[]>> {
    const where: FindOptionsWhere<Comment> = { user: { banInfo: { isBanned: false } } };

    if (settings.forPostId) {
      where.postId = settings.forPostId;
    }
    if (settings.commentsOnlyForBlogsOfUserId) {
      where.post = { blog: { userId: settings.commentsOnlyForBlogsOfUserId } };
    }

    const [foundComments, totalCount] = await this.repo.findAndCount({
      where,
      order: { [query.sortBy]: query.sortDirection.toUpperCase() },
      skip: (query.pageNumber - 1) * query.pageSize,
      take: query.pageSize,
    });

    let comments;
    if (foundComments.length > 0) {
      comments = foundComments.map((c) => ({
        ...c,
        likes: cutLikesByBannedUsers<LikeComment>(c.likes),
      }));
    }

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: comments ? comments : [],
    };
  }
}
