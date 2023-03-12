import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEntity } from './entities/game.entity';
import { Repository } from 'typeorm';
import { PlayerEntity } from './entities/player.entity';
import { GamePairViewModel } from './models/GameModels';
import { ViewModelMapper } from '../shared/view-model-mapper';
import { PaginatorResponseType } from '../shared/types/paginator-response-type';
import { GamesQuery } from './models/GameQueryModel';

@Injectable()
export class GamesQueryRepo {
  constructor(
    @InjectRepository(GameEntity) private readonly repo: Repository<GameEntity>,
    private readonly viewModelMapper: ViewModelMapper,
  ) {}

  async findGames(query: GamesQuery, userId: number): Promise<PaginatorResponseType<GamePairViewModel[]>> {
    const builder = this.repo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.players', 'player')
      .leftJoinAndSelect('player.user', 'user')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('player2.gameId')
          .from(PlayerEntity, 'player2')
          .where('player2.userId = :userId', { userId })
          .getQuery();

        return 'game.id IN ' + subQuery;
      })
      .orderBy(`game.${query.sortBy}`, query.sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('player.connectedAt', 'ASC'); // players in game should be sorted by connectedAt by default

    const [games, total] = await builder
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getManyAndCount();

    return {
      pagesCount: Math.ceil(total / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: total,
      items: games.map(this.viewModelMapper.getGameViewModel.bind(this.viewModelMapper)),
    };
  }
}
