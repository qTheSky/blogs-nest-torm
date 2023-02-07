import { UserViewModel } from './models/UserViewModel';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { ViewModelMapper } from '../common/view-model-mapper';
import { User, UserModel } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { NormalizedUsersQuery } from '../common/query-normalizer';

export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModel, private viewModelConverter: ViewModelMapper) {}

  async findUsers(query: NormalizedUsersQuery): Promise<PaginatorResponseType<UserViewModel[]>> {
    let filter: any = {};

    const sort: any = {
      [`accountData.${query.sortBy}`]: query.sortDirection === 'desc' ? -1 : 1,
    };

    if (query.banStatus !== 'all') {
      filter['banInfo.isBanned'] = getTrueOrFalse(query.banStatus);
      function getTrueOrFalse(banStatus: string): boolean {
        switch (banStatus) {
          case 'banned':
            return true;
          case 'notBanned':
            return false;
          default:
            return;
        }
      }
    }

    if (query.searchLoginTerm) {
      filter['accountData.login'] = { $regex: query.searchLoginTerm, $options: 'i' };
    }
    if (query.searchEmailTerm) {
      filter['accountData.email'] = { $regex: query.searchEmailTerm, $options: 'i' };
    }
    if (filter['accountData.login'] && filter['accountData.email']) {
      filter = {
        $or: [
          { 'accountData.email': { $regex: query.searchEmailTerm, $options: 'i' } },
          { 'accountData.login': { $regex: query.searchLoginTerm, $options: 'i' } },
        ],
      };
    }

    const totalCount = await this.UserModel.countDocuments(filter);
    const users = await this.UserModel.find(filter)
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .sort(sort)
      .lean();

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: users.map(this.viewModelConverter.getUserViewModel),
    };
  }
}
