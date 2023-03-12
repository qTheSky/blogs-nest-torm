import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { PaginatorResponseType } from '../shared/types/paginator-response-type';
import { BlogsQuery } from './models/QueryBlogModel';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectRepository(BlogEntity) private readonly repo: Repository<BlogEntity>) {}

  async findBlogs(
    query: BlogsQuery,
    settings: { blogsOfSpecifiedUserId?: number; isAdminRequesting?: boolean } = {
      blogsOfSpecifiedUserId: undefined,
      isAdminRequesting: false,
    },
  ): Promise<PaginatorResponseType<BlogEntity[]>> {
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
