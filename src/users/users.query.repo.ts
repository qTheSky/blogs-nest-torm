import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NormalizedUsersQuery } from '../common/query-normalizer';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { UserViewModel } from './models/UserViewModel';
import { ViewModelMapper } from '../common/view-model-mapper';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly viewModelMapper: ViewModelMapper,
  ) {}

  async findUsers(query: NormalizedUsersQuery): Promise<PaginatorResponseType<UserViewModel[]>> {
    const builder = this.usersRepo.createQueryBuilder('u').leftJoinAndSelect('u.banInfo', 'banInfo');
    if (query.searchLoginTerm) {
      // builder.andWhere('LOWER(u.login) LIKE LOWER (:login)', { login: `%${query.searchLoginTerm}%` });
      builder.andWhere('u.login ILIKE :login', { login: `%${query.searchLoginTerm}%` });
    }

    if (query.searchEmailTerm) {
      // builder.orWhere('LOWER(u.email) LIKE LOWER (:email)', { email: `%${query.searchEmailTerm}%` });
      builder.orWhere('u.email ILIKE :email', { email: `%${query.searchEmailTerm}%` });
    }

    if (query.banStatus !== 'all') {
      builder.andWhere('banInfo.isBanned = :isBanned', { isBanned: getTrueOrFalse(query.banStatus) });

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

    builder.orderBy(`u.${query.sortBy}`, query.sortDirection.toUpperCase() as 'ASC' | 'DESC');

    const [users, total] = await builder
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getManyAndCount();

    return {
      pagesCount: Math.ceil(total / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: total,
      items: users.map(this.viewModelMapper.getUserViewModel),
    };
  }
}
