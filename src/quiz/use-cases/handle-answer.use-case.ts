import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepo } from '../games.repo';
import { ForbiddenException } from '@nestjs/common';
import { Answer } from '../entities/player.entity';

export class HandleAnswerCommand {
  constructor(public currentUserId: number, public answer: string) {}
}

@CommandHandler(HandleAnswerCommand)
export class HandleAnswerUseCase implements ICommandHandler<HandleAnswerCommand> {
  constructor(private gamesRepo: GamesRepo) {}

  async execute(command: HandleAnswerCommand): Promise<Answer> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(command.currentUserId);
    console.log('handle answer 1');
    if (!game || !game.isActive() || game.isPlayerAnsweredAllQuestions(command.currentUserId)) {
      throw new ForbiddenException('You are not inside active pair or already answered to all questions');
    }
    console.log('handle answer 2');
    const answer = game.handleAnswer(command.currentUserId, command.answer);
    console.log('handle answer 3');
    const player = game.findPlayerById(command.currentUserId);
    console.log('handle answer 4');
    if (player.isFinishedAnsweringAllQuestions() && !game.isBothPlayersAnsweredAllQuestions()) {
      player.makeFirstFinished();
    }
    console.log('handle answer 5');
    if (game.canBeFinished()) {
      game.finishGame();
    }
    console.log('handle answer 6');
    await this.gamesRepo.save(game);
    console.log('handle answer 7');
    return answer;
  }
}
