import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepo } from '../games.repo';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Answer } from '../entities/player.entity';

export class HandleAnswerCommand {
  constructor(public currentUserId: number, public answer: string) {}
}

@CommandHandler(HandleAnswerCommand)
export class HandleAnswerUseCase implements ICommandHandler<HandleAnswerCommand> {
  constructor(private gamesRepo: GamesRepo) {}

  async execute(command: HandleAnswerCommand): Promise<Answer> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(command.currentUserId);
    if (!game) throw new BadRequestException([{ field: 'id', message: 'Bad game id' }]);
    if (!game.isPlayerCanAnswer(command.currentUserId)) {
      throw new ForbiddenException('You are not inside active pair or already answered to all questions');
    }
    const answer = game.handleAnswer(command.currentUserId, command.answer);
    const player = game.findPlayerById(command.currentUserId);
    if (player.isFinishedAnsweringAllQuestions() && !game.isBothPlayersAnsweredAllQuestions()) {
      player.makeFirstFinished();
    }
    if (game.canBeFinished()) {
      game.finishGame();
    }
    await this.gamesRepo.save(game);
    return answer;
  }
}
