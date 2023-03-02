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
    console.log('connection 1');
    const user = await this.usersRepo.findUserById(command.currentUserId);
    console.log('connection 2');
    const isUserHasActiveOrPendingGame = await this.gamesRepo.findActiveOrPendingGameByUserId(user.id);
    console.log('connection 3');
    if (isUserHasActiveOrPendingGame) throw new ForbiddenException('You are already participating in active pair');
    console.log('connection 4');
    const pendingSecondPlayerGame = await this.gamesRepo.findPendingGame();
    console.log('connection 5');
    if (!pendingSecondPlayerGame) return await this.gamesRepo.createGame(user);
    console.log('connection 6');
    return await this.startGame(user, pendingSecondPlayerGame);
  }

  async startGame(secondPlayer: User, game: Game) {
    console.log('start game');
    const questionsForGame = await this.quizQuestionsRepo.getFiveRandomQuestions();
    console.log('connection 7');
    game.startGame(secondPlayer, questionsForGame);
    console.log('connection 8');
    return await this.gamesRepo.save(game);
  }
}
