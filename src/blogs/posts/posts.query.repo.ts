import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { NormalizedPostsQuery } from '../../common/query-normalizer';
import { PaginatorResponseType } from '../../common/paginator-response-type';
import { cutLikesByBannedUsers } from './utils/cut-likes-by-banned-users';
import { LikePost } from './likes/LikePost.entity';

@Injectable()
export class PostsQueryRepo {
  constructor(@InjectRepository(Post) private readonly repo: Repository<Post>) {}

  async findPosts(query: NormalizedPostsQuery, blogId?: number): Promise<PaginatorResponseType<Post[]>> {
    const filter: FindOptionsWhere<Post> = { blog: { banInfo: { isBanned: false } } };

    if (blogId) {
      filter.blogId = blogId;
    }

    const [foundPosts, totalCount] = await this.repo.findAndCount({
      where: filter,
      order: { [query.sortBy]: query.sortDirection.toUpperCase() },
      skip: (query.pageNumber - 1) * query.pageSize,
      take: query.pageSize,
    });

    let posts;
    if (foundPosts.length > 0) {
      posts = foundPosts.map((p) => ({ ...p, likes: cutLikesByBannedUsers<LikePost>(p.likes) }));
    }

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: posts ? posts : [],
    };
  }
}
