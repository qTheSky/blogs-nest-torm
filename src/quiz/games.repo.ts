import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEntity } from './entities/game.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { PlayerEntity } from './entities/player.entity';
import { GameStatuses } from './models/GameModels';

@Injectable()
export class GamesRepo {
  constructor(@InjectRepository(GameEntity) private readonly repo: Repository<GameEntity>) {}

  async createGame(user: UserEntity) {
    const newGame = GameEntity.create(user);
    return this.save(newGame);
  }

  async findPendingGame(): Promise<GameEntity | null> {
    return this.repo.findOneBy({ status: GameStatuses.PENDING });
  }

  async findGameById(id: number): Promise<GameEntity | null> {
    return this.repo.findOne({ where: { id }, order: { players: { connectedAt: 'ASC' } } }); // players in game should be sorted by connectedAt by default
  }

  async findActiveOrPendingGameByUserId(userId: number): Promise<GameEntity | null> {
    const game = await this.repo
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
      .andWhere('game.status IN (:...statuses)', { statuses: ['Active', 'PendingSecondPlayer'] })
      .orderBy('player.connectedAt', 'ASC') // players in game should be sorted by connectedAt by default
      .getOne();

    return game;
  }

  async save(game: GameEntity): Promise<GameEntity> {
    return await this.repo.save(game);
  }

  async findAllGamesOfUser(userId: number): Promise<GameEntity[]> {
    return await this.repo.find({ where: { players: { userId } } });
  }
}
