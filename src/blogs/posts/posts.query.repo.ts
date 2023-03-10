import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { PaginatorResponseType } from '../../shared/types/paginator-response-type';
import { cutLikesByBannedUsers } from './utils/cut-likes-by-banned-users';
import { LikePost } from './likes/LikePost.entity';
import { PostsQuery } from './models/QueryPostModel';

@Injectable()
export class PostsQueryRepo {
  constructor(@InjectRepository(PostEntity) private readonly repo: Repository<PostEntity>) {}

  async findPosts(query: PostsQuery, blogId?: number): Promise<PaginatorResponseType<PostEntity[]>> {
    const where: FindOptionsWhere<PostEntity> = { blog: { banInfo: { isBanned: false } } };
    let order: FindOptionsOrder<PostEntity> = { [query.sortBy]: query.sortDirection };
    if (query.sortBy === 'blogName') {
      order = { blog: { name: query.sortDirection as 'asc' | 'desc' } };
    }
    if (blogId) {
      where.blogId = blogId;
    }

    const [foundPosts, totalCount] = await this.repo.findAndCount({
      where,
      order,
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
