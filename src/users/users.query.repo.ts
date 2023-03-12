import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatorResponseType } from '../shared/types/paginator-response-type';
import { UserViewModel } from './models/UserViewModel';
import { ViewModelMapper } from '../shared/view-model-mapper';
import { UsersQuery } from './models/QueryUserModel';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    private readonly viewModelMapper: ViewModelMapper,
  ) {}

  async findUsers(query: UsersQuery): Promise<PaginatorResponseType<UserViewModel[]>> {
    const builder = this.repo.createQueryBuilder('u').leftJoinAndSelect('u.banInfo', 'banInfo');
    builder.orderBy(`u.${query.sortBy}`, query.sortDirection.toUpperCase() as 'ASC' | 'DESC');

    if (query.searchLoginTerm) {
      builder.where('u.login ILIKE :login', { login: `%${query.searchLoginTerm}%` });
    }
    if (query.searchEmailTerm) {
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
