import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepo } from '../games.repo';
import { ForbiddenException } from '@nestjs/common';
import { Answer } from '../entities/player.entity';
import { PlayerStatisticsRepo } from '../player.statistics.repo';
import { GameEntity } from '../entities/game.entity';

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
    }
    if (game.canBeFinished()) {
      game.finishGame();
      await this.gamesRepo.save(game); //because when updating statistics, there should be a game with actual information
      await this.updatePlayersStatistics(game);
    }
    await this.gamesRepo.save(game);
    return answer;
  }

  async updatePlayersStatistics(game: GameEntity) {
    const { players } = await this.gamesRepo.findGameByIdWithPlayersWithStatistics(game.id);
    for (const player of players) {
      const statistics = player.statistics;
      statistics.gamesCount++;
      statistics.sumScore += player.score;
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
