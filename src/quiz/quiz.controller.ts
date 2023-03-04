import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrConnectToGameCommand } from './use-cases/create-or-connect-to-game.use-case';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { ViewModelMapper } from '../common/view-model-mapper';
import { AnswerViewModel, GamePairViewModel } from './models/GameModels';
import { GamesRepo } from './games.repo';
import { AnswerInputModel } from './models/AnswerInputModel';
import { HandleAnswerCommand } from './use-cases/handle-answer.use-case';
import { Answer } from './entities/player.entity';
import { GameQueryModel } from './models/GameQueryModel';
import { GamesQueryRepo } from './games.query.repo';
import { QueryNormalizer } from '../common/query-normalizer';
import { ParseNumberPipe } from '../common/pipes/parse-number-pipe';
import { StatisticsViewModel } from './models/StatisticsViewModel';
import { GetMyStatisticsCommand } from './use-cases/get-my-statistics.use-case';

@Controller('pair-game-quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private viewModelMapper: ViewModelMapper,
    private gamesRepo: GamesRepo,
    private gamesQueryRepo: GamesQueryRepo,
    private queryNormalizer: QueryNormalizer,
  ) {}

  @Get('users/my-statistic')
  async getStatisticsOfUser(@CurrentUserId() currentUserId: number): Promise<StatisticsViewModel> {
    return this.commandBus.execute<GetMyStatisticsCommand, StatisticsViewModel>(
      new GetMyStatisticsCommand(currentUserId),
    );
  }

  @Get('pairs/my')
  async findGamesOfUser(@CurrentUserId() currentUserId: number, @Query() query: GameQueryModel) {
    const normalizeQuizGamesQuery = this.queryNormalizer.normalizeQuizGamesQuery(query);
    return this.gamesQueryRepo.findGames(normalizeQuizGamesQuery, currentUserId);
  }

  @Get('pairs/my-current')
  async getCurrentGame(@CurrentUserId() currentUserId: number): Promise<GamePairViewModel> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(currentUserId);
    if (!game) throw new NotFoundException('You dont have any active or pending games');
    return this.viewModelMapper.getGameViewModel(game);
  }

  @Get('pairs/:gameId')
  async getGameById(
    @Param('gameId', ParseNumberPipe) gameId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<GamePairViewModel> {
    const game = await this.gamesRepo.findGameById(gameId);
    // if (!game) throw new BadRequestException([{ field: 'id', message: 'bad id' }]);
    if (!game) throw new NotFoundException('Game not found');
    if (!game.isPlayerParticipant(currentUserId)) throw new ForbiddenException('You are not participant in this game');
    return this.viewModelMapper.getGameViewModel(game);
  }

  @Post('pairs/connection')
  @HttpCode(200)
  async createGameOrConnectToExist(@CurrentUserId() currentUserId: number): Promise<GamePairViewModel> {
    const newGame = await this.commandBus.execute(new CreateOrConnectToGameCommand(currentUserId));
    return this.viewModelMapper.getGameViewModel(newGame);
  }

  @Post('pairs/my-current/answers')
  @HttpCode(200)
  async handleAnswerByPlayer(
    @CurrentUserId() currentUserId: number,
    @Body() answerModel: AnswerInputModel,
  ): Promise<AnswerViewModel> {
    const answer = await this.commandBus.execute<HandleAnswerCommand, Answer>(
      new HandleAnswerCommand(currentUserId, answerModel.answer),
    );
    return this.viewModelMapper.getAnswerViewModel(answer);
  }
}
