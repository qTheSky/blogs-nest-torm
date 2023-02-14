import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BannedUserInBlog } from './entities/banned-user-in-blog.entity';
import { Repository } from 'typeorm';
import { NormalizedBannedUsersInBlogQuery } from '../common/query-normalizer';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { BannedUserInBlogViewModel } from './models/BannedUserInBlogViewModel';
import { ViewModelMapper } from '../common/view-model-mapper';

@Injectable()
export class BannedUsersInBlogQueryRepo {
  constructor(
    @InjectRepository(BannedUserInBlog) private readonly repo: Repository<BannedUserInBlog>,
    private viewModelMapper: ViewModelMapper,
  ) {}
  async findUsers(
    query: NormalizedBannedUsersInBlogQuery,
    blogId: number,
  ): Promise<PaginatorResponseType<BannedUserInBlogViewModel[]>> {
    const builder = this.repo.createQueryBuilder(`u`).where('u.blogId = :blogId', { blogId });

    builder.orderBy(`u.${query.sortBy}`, query.sortDirection.toUpperCase() as 'ASC' | 'DESC');

    if (query.searchLoginTerm) {
      builder.where('u.login ILIKE :login', { login: `%${query.searchLoginTerm}%` });
    }
    const [users, total] = await builder
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getManyAndCount();
    return {
      pagesCount: Math.ceil(total / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: total,
      items: users.map(this.viewModelMapper.getBannedUserInBlogViewModel),
    };
  }
}
