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
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrConnectToGameCommand } from './use-cases/create-or-connect-to-game.use-case';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { ViewModelMapper } from '../shared/view-model-mapper';
import { AnswerViewModel, GamePairViewModel } from './models/GameModels';
import { GamesRepo } from './games.repo';
import { AnswerInputModel } from './models/AnswerInputModel';
import { HandleAnswerCommand } from './use-cases/handle-answer.use-case';
import { Answer } from './entities/player.entity';
import { GamesQueryRepo } from './games.query.repo';
import { ParseNumberPipe } from '../shared/pipes/parse-number-pipe';
import { StatisticsViewModel } from './models/StatisticsViewModel';
import { PlayerStatisticsRepo } from './player.statistics.repo';
import { GamesQuery } from './models/GameQueryModel';
import { TopPlayersQueryRepo } from './top-players.query.repo';
import { TopPlayersQuery } from './models/TopPlayersQuery';

@Controller('pair-game-quiz')
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private viewModelMapper: ViewModelMapper,
    private gamesRepo: GamesRepo,
    private gamesQueryRepo: GamesQueryRepo,
    private playerStatisticsRepo: PlayerStatisticsRepo,
    private topPlayersQueryRepo: TopPlayersQueryRepo,
  ) {}

  @UseInterceptors()
  @Get('users/top')
  async getTopUsers(@Query() query: TopPlayersQuery) {
    return this.topPlayersQueryRepo.findTopPlayers(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/my-statistic')
  async getStatisticsOfUser(@CurrentUserId() currentUserId: number): Promise<StatisticsViewModel> {
    const stats = await this.playerStatisticsRepo.findUserStatistics(currentUserId);
    if (!stats) throw new NotFoundException('Stats not found');
    return this.viewModelMapper.getPlayerStatsViewModel(stats);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my')
  async findGamesOfUser(@CurrentUserId() currentUserId: number, @Query() query: GamesQuery) {
    return this.gamesQueryRepo.findGames(query, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my-current')
  async getCurrentGame(@CurrentUserId() currentUserId: number): Promise<GamePairViewModel> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(currentUserId);
    if (!game) throw new NotFoundException('You dont have any active or pending games');
    return this.viewModelMapper.getGameViewModel(game);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('pairs/connection')
  @HttpCode(200)
  async createGameOrConnectToExist(@CurrentUserId() currentUserId: number): Promise<GamePairViewModel> {
    const newGame = await this.commandBus.execute(new CreateOrConnectToGameCommand(currentUserId));
    return this.viewModelMapper.getGameViewModel(newGame);
  }

  @UseGuards(JwtAuthGuard)
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
