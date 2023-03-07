import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../users/users.repo';
import { GamesRepo } from '../games.repo';
import { GameEntity, QuestionInGame } from '../entities/game.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { QuizQuestionsRepo } from '../../super-admin/quiz.questions.repo';
import { ForbiddenException } from '@nestjs/common';
import { PlayerStatisticsRepo } from '../player.statistics.repo';
import { PlayerStatisticsEntity } from '../entities/player-statistics.entity';

export class CreateOrConnectToGameCommand {
  constructor(public currentUserId: number) {}
}

@CommandHandler(CreateOrConnectToGameCommand)
export class CreateOrConnectToGameUseCase implements ICommandHandler<CreateOrConnectToGameCommand> {
  constructor(
    private usersRepo: UsersRepo,
    private gamesRepo: GamesRepo,
    private quizQuestionsRepo: QuizQuestionsRepo,
    private playerStatisticsRepo: PlayerStatisticsRepo,
  ) {}

  async execute(command: CreateOrConnectToGameCommand) {
    const user = await this.usersRepo.findUserById(command.currentUserId);
    const isUserHasActiveOrPendingGame = await this.gamesRepo.findActiveOrPendingGameByUserId(user.id);
    if (isUserHasActiveOrPendingGame) throw new ForbiddenException('You are already participating in active pair');

    let playerStatistics: PlayerStatisticsEntity | null = await this.playerStatisticsRepo.findUserStatistics(user.id);
    if (!playerStatistics) {
      playerStatistics = await this.playerStatisticsRepo.create(user);
    }

    const pendingSecondPlayerGame = await this.gamesRepo.findPendingGame();
    if (!pendingSecondPlayerGame) return await this.gamesRepo.createGame(user, playerStatistics);
    return await this.startGame(pendingSecondPlayerGame, user, playerStatistics);
  }

  async startGame(game: GameEntity, secondPlayer: UserEntity, secondUserStatistics: PlayerStatisticsEntity) {
    const questionsForGame = await this.quizQuestionsRepo.getRandomQuestionsForStartGame();
    const questions: QuestionInGame[] = questionsForGame.map((q) => ({
      id: q.id,
      body: q.body,
      correctAnswers: q.correctAnswers,
    })); // map because in questionsForGame plenty of unnecessary fields
    game.startGame(secondPlayer, questions, secondUserStatistics);
    return await this.gamesRepo.save(game);
  }
}
