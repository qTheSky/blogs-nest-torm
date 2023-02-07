import { InjectModel } from '@nestjs/mongoose';
import { NormalizedBannedUsersInBlogQuery } from '../common/query-normalizer';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { ViewModelMapper } from '../common/view-model-mapper';
import { BannedUserInBlogViewModel } from './models/BannedUserInBlogViewModel';
import { Types } from 'mongoose';
import { BannedUserInBlog, BannedUserInBlogModel } from './banned-user-in-blog.schema';

export class BannedUsersInBlogQueryRepository {
  constructor(
    @InjectModel(BannedUserInBlog.name) private BannedUserInBlogModel: BannedUserInBlogModel,
    private viewModelConverter: ViewModelMapper,
  ) {}

  async findUsers(
    query: NormalizedBannedUsersInBlogQuery,
    blogId: Types.ObjectId,
  ): Promise<PaginatorResponseType<BannedUserInBlogViewModel[]>> {
    const filter: any = { blogId };
    const sort: any = {
      [query.sortBy]: query.sortDirection === 'desc' ? -1 : 1,
    };
    if (query.searchLoginTerm) {
      filter.login = { $regex: query.searchLoginTerm, $options: 'i' };
    }

    const totalCount = await this.BannedUserInBlogModel.countDocuments(filter);
    const paginationInfo = {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
    };
    const bannedUsers = await this.BannedUserInBlogModel.find(filter)
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .sort(sort)
      .lean();
    return { ...paginationInfo, items: bannedUsers.map(this.viewModelConverter.getBannedUserInBlogViewModel) };
  }
}
