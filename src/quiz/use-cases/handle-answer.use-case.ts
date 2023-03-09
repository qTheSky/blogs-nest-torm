import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepo } from '../games.repo';
import { ForbiddenException } from '@nestjs/common';
import { Answer } from '../entities/player.entity';
import { PlayerStatisticsRepo } from '../player.statistics.repo';
import { GameEntity } from '../entities/game.entity';
import { add } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';

export class HandleAnswerCommand {
  constructor(public currentUserId: number, public answer: string) {}
}

@CommandHandler(HandleAnswerCommand)
export class HandleAnswerUseCase implements ICommandHandler<HandleAnswerCommand> {
  constructor(private gamesRepo: GamesRepo, private playerStatisticsRepo: PlayerStatisticsRepo) {}

  async execute(command: HandleAnswerCommand): Promise<Answer> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(command.currentUserId);
    if (!game || !game.isActive() || game.isPlayerAnsweredAllQuestions(command.currentUserId)) {
      throw new ForbiddenException('You are not inside active pair or already answered to all questions');
    }
    const answer = game.handleAnswer(command.currentUserId, command.answer);
    const player = game.findPlayerById(command.currentUserId);
    if (player.isFinishedAnsweringAllQuestions() && !game.isBothPlayersAnsweredAllQuestions()) {
      player.makeFirstFinished();
      game.forciblyFinishDate = add(new Date(), { seconds: 10 }); // after 10 seconds game will finish automatically using CRON
    }
    if (game.canBeFinished()) {
      await this.finishGame(game);
    }
    await this.gamesRepo.save(game);
    return answer;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkAndFinishActiveGames() {
    const activeGames = await this.gamesRepo.findAllActiveGames();
    for (const game of activeGames) {
      if (game.forciblyFinishDate !== null && game.forciblyFinishDate < new Date()) {
        await this.finishGame(game, true);
      }
    }
  }

  async finishGame(game: GameEntity, isForcibly = false) {
    game.finishGame(isForcibly);
    await this.gamesRepo.save(game); //because when updating statistics, there should be a game with actual information
    await this.updatePlayersStatistics(game);
  }

  async updatePlayersStatistics(game: GameEntity) {
    const { players } = await this.gamesRepo.findGameByIdWithPlayersWithStatistics(game.id);
    for (const player of players) {
      const statistics = player.statistics;
      statistics.gamesCount++;
      statistics.sumScore += player.score;
      statistics.avgScores = (statistics.sumScore / statistics.gamesCount).toFixed(2);

      if (game.winnerId === null) {
        statistics.drawsCount++;
      }
      if (game.winnerId === player.userId) {
        statistics.winsCount++;
      }
      if (game.winnerId !== player.userId && game.winnerId !== null) {
        statistics.lossesCount++;
      }
      await this.playerStatisticsRepo.save(statistics);
    }
  }
}
