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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { topPlayerExample } from '../shared/swagger/schema/quiz/top-player-example';
import { unauthorizedSwaggerMessage } from '../shared/swagger/constants/unauthorized-swagger-message';
import { statisticsExample } from '../shared/swagger/schema/quiz/statistics-example';
import { getPaginatorExample } from '../shared/swagger/schema/common/get-paginator-example';
import { gameExample } from '../shared/swagger/schema/quiz/game-example';
import { answerExample } from '../shared/swagger/schema/quiz/answer-example';
import { TopPlayerViewModel } from './models/TopPlayerViewModel';

@ApiTags('PairQuizGame')
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

  @Get('users/top')
  @ApiOperation({ summary: 'Get users top' })
  @ApiResponse({ status: 200, schema: { example: getPaginatorExample<TopPlayerViewModel>(topPlayerExample) } })
  async getTopUsers(@Query() query: TopPlayersQuery) {
    return this.topPlayersQueryRepo.findTopPlayers(query);
  }

  @Get('users/my-statistic')
  @ApiOperation({ summary: 'Get current user statistic' })
  @ApiResponse({ status: 200, schema: { example: statisticsExample } })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getStatisticsOfUser(@CurrentUserId() currentUserId: number): Promise<StatisticsViewModel> {
    const stats = await this.playerStatisticsRepo.findUserStatistics(currentUserId);
    if (!stats) throw new NotFoundException('Stats not found');
    return this.viewModelMapper.getPlayerStatsViewModel(stats);
  }

  @Get('pairs/my')
  @ApiOperation({ summary: 'Returns all my games (closed games and current)' })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiResponse({
    status: 200,
    description: 'Returns pair by id if current user is taking part in this pair',
    schema: { example: getPaginatorExample<GamePairViewModel>(gameExample) },
  })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findGamesOfUser(@CurrentUserId() currentUserId: number, @Query() query: GamesQuery) {
    return this.gamesQueryRepo.findGames(query, currentUserId);
  }

  @Get('pairs/my-current')
  @ApiOperation({ summary: 'Returns current unfinished user game' })
  @ApiResponse({
    status: 200,
    description: 'Returns current pair in which current user is taking part',
    schema: { example: gameExample },
  })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiNotFoundResponse({ description: 'If no active pair for current user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCurrentGame(@CurrentUserId() currentUserId: number): Promise<GamePairViewModel> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(currentUserId);
    if (!game) throw new NotFoundException('You dont have any active or pending games');
    return this.viewModelMapper.getGameViewModel(game);
  }

  @Get('pairs/:gameId')
  @ApiOperation({ summary: 'Returns game by id' })
  @ApiParam({ name: 'gameId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Returns pair by id', schema: { example: gameExample } })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: 'If current user tries to get pair in which user is not participant' })
  @ApiNotFoundResponse({ description: 'If game not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiOperation({
    summary:
      'Connect current user to existing random pending pair or create new pair which will be waiting second player',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns started existing pair or new pair with status "PendingSecondPlayer"',
    schema: { example: gameExample },
  })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: 'If current user is already participating in active pair' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async createGameOrConnectToExist(@CurrentUserId() currentUserId: number): Promise<GamePairViewModel> {
    const newGame = await this.commandBus.execute(new CreateOrConnectToGameCommand(currentUserId));
    return this.viewModelMapper.getGameViewModel(newGame);
  }

  @Post('pairs/my-current/answers')
  @ApiOperation({ summary: 'Send answer for next not answered question in active pair' })
  @ApiResponse({ status: 200, description: 'Returns answer result', schema: { example: answerExample } })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({
    description:
      'If current user is not inside active pair or user is in active pair but has already answered to all questions',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
