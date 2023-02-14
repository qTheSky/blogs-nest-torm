import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { NormalizedBlogsQuery } from '../common/query-normalizer';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectRepository(Blog) private readonly repo: Repository<Blog>) {}

  async findBlogs(
    query: NormalizedBlogsQuery,
    settings: { blogsOfSpecifiedUserId?: number; isAdminRequesting?: boolean } = {
      blogsOfSpecifiedUserId: undefined,
      isAdminRequesting: false,
    },
  ): Promise<PaginatorResponseType<Blog[]>> {
    const builder = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.banInfo', 'banInfo')
      .orderBy(`b.${query.sortBy}`, query.sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .where('banInfo.isBanned = false');

    if (settings.isAdminRequesting) {
      builder.orWhere('banInfo.isBanned = true').leftJoinAndSelect('b.user', 'u');
    }

    if (settings.blogsOfSpecifiedUserId) {
      builder.where('b.userId = :userId', { userId: settings.blogsOfSpecifiedUserId });
    }
    if (query.searchNameTerm) {
      builder.where('b.name ILIKE :name', { name: `%${query.searchNameTerm}%` });
    }

    const [blogs, total] = await builder
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getManyAndCount();
    return {
      pagesCount: Math.ceil(total / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: total,
      items: blogs,
    };
  }
}
