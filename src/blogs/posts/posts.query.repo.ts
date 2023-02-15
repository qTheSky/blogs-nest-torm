import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { NormalizedPostsQuery } from '../../common/query-normalizer';
import { PaginatorResponseType } from '../../common/paginator-response-type';
import { cutLikesByBannedUsers } from './utils/cut-likes-by-banned-users';
import { LikePost } from './likes/LikePost.entity';

@Injectable()
export class PostsQueryRepo {
  constructor(@InjectRepository(Post) private readonly repo: Repository<Post>) {}

  async findPosts(query: NormalizedPostsQuery, blogId?: number): Promise<PaginatorResponseType<Post[]>> {
    const where: FindOptionsWhere<Post> = { blog: { banInfo: { isBanned: false } } };
    let order: FindOptionsOrder<Post> = { [query.sortBy]: query.sortDirection };
    if (query.sortDirection === 'blogName') {
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
  //deprecated
  async _findPosts(query: NormalizedPostsQuery, blogId?: number): Promise<PaginatorResponseType<Post[]>> {
    let sort = `post.${query.sortBy}`;
    if (query.sortBy === 'blogName') {
      sort = `blog.name`;
    }
    const builder = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('blog.banInfo', 'blogBanInfo')
      .where('blogBanInfo.isBanned = false')
      .leftJoinAndSelect('post.likes', 'like')
      .leftJoinAndSelect('like.user', 'liker')
      .leftJoinAndSelect('liker.banInfo', 'likerBanInfo')
      .orderBy(sort, query.sortDirection.toUpperCase() as 'ASC' | 'DESC');

    if (blogId) {
      builder.where('post.blogId = :blogId', { blogId });
    }

    const [foundPosts, totalCount] = await builder
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getManyAndCount();

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
  //deprecated
}
