import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerStatisticsRepo } from './player.statistics.repo';
import { Repository } from 'typeorm';

@Injectable()
export class TopPlayersQueryRepo {
  constructor(@InjectRepository(PlayerStatisticsRepo) private readonly repo: Repository<PlayerStatisticsRepo>) {}

  async findTopPlayers() {}
}
