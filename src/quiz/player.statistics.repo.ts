import { InjectRepository } from '@nestjs/typeorm';
import { PlayerStatisticsEntity } from './entities/player-statistics.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class PlayerStatisticsRepo {
  constructor(@InjectRepository(PlayerStatisticsEntity) private readonly repo: Repository<PlayerStatisticsEntity>) {}

  async create(user: UserEntity): Promise<PlayerStatisticsEntity> {
    const statistics = PlayerStatisticsEntity.create(user);
    return this.repo.save(statistics);
  }

  async findUserStatistics(userId: number): Promise<PlayerStatisticsEntity | null> {
    return this.repo.findOneBy({ userId });
  }

  async save(stats: PlayerStatisticsEntity): Promise<PlayerStatisticsEntity> {
    return await this.repo.save(stats);
  }
}
