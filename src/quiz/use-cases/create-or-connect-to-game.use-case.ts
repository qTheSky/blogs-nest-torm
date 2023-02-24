import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../users/users.repo';
import { GamesRepo } from '../games.repo';
import { Game } from '../entities/game.entity';
import { User } from '../../users/entities/user.entity';
import { QuizQuestionsRepo } from '../../super-admin/quiz.questions.repo';
import { ForbiddenException } from '@nestjs/common';

export class CreateOrConnectToGameCommand {
  constructor(public currentUserId: number) {}
}

@CommandHandler(CreateOrConnectToGameCommand)
export class CreateOrConnectToGameUseCase implements ICommandHandler<CreateOrConnectToGameCommand> {
  constructor(
    private usersRepo: UsersRepo,
    private gamesRepo: GamesRepo,
    private quizQuestionsRepo: QuizQuestionsRepo,
  ) {}

  async execute(command: CreateOrConnectToGameCommand) {
    const user = await this.usersRepo.findUserById(command.currentUserId);
    const isUserHasActiveOrPendingGame = await this.gamesRepo.findActiveOrPendingGameByUserId(user.id);
    if (isUserHasActiveOrPendingGame) throw new ForbiddenException('You are already participating in active pair');
    const pendingSecondPlayerGame = await this.gamesRepo.findPendingGame();
    if (!pendingSecondPlayerGame) {
      return await this.gamesRepo.createGame(user);
    }
    return await this.startGame(user, pendingSecondPlayerGame);
  }

  async startGame(secondPlayer: User, game: Game) {
    const questionsForGame = await this.quizQuestionsRepo.getFiveRandomQuestions();
    game.startGame(secondPlayer, questionsForGame);
    return await this.gamesRepo.save(game);
  }
}
