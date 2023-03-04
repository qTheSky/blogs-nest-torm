import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StatisticsViewModel } from '../models/StatisticsViewModel';
import { GamesRepo } from '../games.repo';
import { GameEntity } from '../entities/game.entity';
import { GameStatuses } from '../models/GameModels';

export class GetMyStatisticsCommand {
  constructor(public currentUserId: number) {}
}

@CommandHandler(GetMyStatisticsCommand)
export class GetMyStatisticsUseCase implements ICommandHandler<GetMyStatisticsCommand> {
  constructor(private gamesRepo: GamesRepo) {}

  async execute(command: GetMyStatisticsCommand): Promise<StatisticsViewModel> {
    const allUserGames = await this.gamesRepo.findAllGamesOfUser(command.currentUserId);
    const finishedGames = this.cutNotFinishedGames(allUserGames);

    const gamesCount = finishedGames.length;
    const sumScore = this.getSumScore(finishedGames, command.currentUserId);
    const { winsCount, lossesCount, drawsCount } = this.countWinsDrawsAndLoses(finishedGames, command.currentUserId);

    return {
      gamesCount,
      sumScore,
      drawsCount,
      winsCount,
      lossesCount,
      avgScores: this.getAvgScore(gamesCount, sumScore),
    };
  }

  cutNotFinishedGames(games: GameEntity[]): GameEntity[] {
    const finishedGames: GameEntity[] = [];
    for (const game of games) {
      if (game.status === GameStatuses.FINISHED) {
        finishedGames.push(game);
      }
    }
    return finishedGames;
  }

  countWinsDrawsAndLoses(
    games: GameEntity[],
    userId: number,
  ): { lossesCount: number; winsCount: number; drawsCount: number } {
    let lossesCount = 0;
    let winsCount = 0;
    let drawsCount = 0;
    for (const game of games) {
      if (game.winnerId === null) {
        drawsCount++;
      }
      if (game.winnerId === userId) {
        winsCount++;
      }
      if (game.winnerId !== userId && game.winnerId !== null) {
        lossesCount++;
      }
    }
    return { lossesCount, drawsCount, winsCount };
  }

  getSumScore(games: GameEntity[], userId: number): number {
    let sum = 0;
    games.forEach((g) => {
      const player = g.findPlayerById(userId);
      sum += player.score;
    });
    return sum;
  }

  getAvgScore(gamesCount: number, totalScore: number): number {
    return +(totalScore / gamesCount).toFixed(2);
  }
}
