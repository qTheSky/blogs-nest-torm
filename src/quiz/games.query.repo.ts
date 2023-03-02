import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { NormalizedQuizGamesQuery } from '../common/query-normalizer';
import { Player } from './entities/player.entity';
import { GamePairViewModel } from './models/GameModels';
import { ViewModelMapper } from '../common/view-model-mapper';
import { PaginatorResponseType } from '../common/paginator-response-type';

@Injectable()
export class GamesQueryRepo {
  constructor(
    @InjectRepository(Game) private readonly repo: Repository<Game>,
    private readonly viewModelMapper: ViewModelMapper,
  ) {}

  async findGames(
    query: NormalizedQuizGamesQuery,
    userId: number,
  ): Promise<PaginatorResponseType<GamePairViewModel[]>> {
    const builder = this.repo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.players', 'player')
      .leftJoinAndSelect('player.user', 'user')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('player2.gameId')
          .from(Player, 'player2')
          .where('player2.userId = :userId', { userId })
          .getQuery();

        return 'game.id IN ' + subQuery;
      })
      .orderBy('player.connectedAt', 'ASC') // players in game should be sorted by connectedAt by default
      .orderBy(`game.${query.sortBy}`, query.sortDirection.toUpperCase() as 'ASC' | 'DESC');

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
