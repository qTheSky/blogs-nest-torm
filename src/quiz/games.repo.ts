import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Player } from './entities/player.entity';

@Injectable()
export class GamesRepo {
  constructor(@InjectRepository(Game) private readonly repo: Repository<Game>) {}

  async createGame(user: User) {
    const newGame = Game.create(user);
    return this.save(newGame);
  }

  async findPendingGame(): Promise<Game | null> {
    return this.repo.findOneBy({ status: 'PendingSecondPlayer' });
  }

  async findGameById(id: number): Promise<Game | null> {
    return this.repo.findOne({ where: { id }, order: { players: { connectedAt: 'ASC' } } }); // players in game should be sorted by connectedAt by default
  }

  async findActiveOrPendingGameByUserId(userId: number): Promise<Game | null> {
    const game = await this.repo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.players', 'player')
      .leftJoinAndSelect('player.user', 'user')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('player2.gameId')
          .from(Player, 'player2')
          .where('player2.userId = :userId', { userId }) // players in game should be sorted by connectedAt by default
          .getQuery();

        return 'game.id IN ' + subQuery;
      })
      .andWhere('game.status IN (:...statuses)', { statuses: ['Active', 'PendingSecondPlayer'] })
      .orderBy('player.connectedAt', 'ASC')
      .getOne();

    return game;
  }

  async save(game: Game): Promise<Game> {
    return await this.repo.save(game);
  }
}
