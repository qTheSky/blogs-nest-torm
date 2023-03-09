import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TopPlayersQuery } from './models/TopPlayersQuery';
import { PlayerStatisticsEntity } from './entities/player-statistics.entity';

@Injectable()
export class TopPlayersQueryRepo {
  constructor(@InjectRepository(PlayerStatisticsEntity) private readonly repo: Repository<PlayerStatisticsEntity>) {}

  async findTopPlayers(query: TopPlayersQuery) {
    const builder = this.repo.createQueryBuilder('playerStatistics');

    // Проходим по всем параметрам сортировки и добавляем их в запрос
    for (const sort of query.sort) {
      const [field, _direction] = sort.split(' ');
      const direction = _direction.toUpperCase();
      builder.addOrderBy(`playerStatistics.${field}`, direction as 'ASC' | 'DESC');
    }

    const [players, total] = await builder
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getManyAndCount();

    return {
      pagesCount: Math.ceil(total / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: total,
      items: players,
    };
  }
}
