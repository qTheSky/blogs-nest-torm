import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../users/users.repo';
import { GamesRepo } from '../games.repo';
import { GameEntity, QuestionInGame } from '../entities/game.entity';
import { UserEntity } from '../../users/entities/user.entity';
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
    if (!pendingSecondPlayerGame) return await this.gamesRepo.createGame(user);
    return await this.startGame(user, pendingSecondPlayerGame);
  }

  async startGame(secondPlayer: UserEntity, game: GameEntity) {
    const questionsForGame = await this.quizQuestionsRepo.getRandomQuestionsForStartGame();
    const questions: QuestionInGame[] = questionsForGame.map((q) => ({
      id: q.id,
      body: q.body,
      correctAnswers: q.correctAnswers,
    })); // map because in questionsForGame plenty of unnecessary fields
    game.startGame(secondPlayer, questions);
    return await this.gamesRepo.save(game);
  }
}
