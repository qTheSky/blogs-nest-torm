import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
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

@Controller('pair-game-quiz/pairs')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private commandBus: CommandBus, private viewModelMapper: ViewModelMapper, private gamesRepo: GamesRepo) {}

  @Get('my-current')
  async getCurrentGame(@CurrentUserId() currentUserId: number): Promise<GamePairViewModel> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(currentUserId);
    if (!game) throw new NotFoundException('You dont have any active or pending games');
    return this.viewModelMapper.getGameViewModel(game);
  }

  @Get(':gameId')
  async getGameById(
    @Param('gameId') gameId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<GamePairViewModel> {
    if (typeof gameId !== 'number' || isNaN(gameId)) {
      throw new NotFoundException('Bad gameId');
    }
    const game = await this.gamesRepo.findGameById(+gameId);
    if (!game) throw new BadRequestException([{ field: 'id', message: 'bad id' }]);
    if (!game.isPlayerParticipant(currentUserId)) throw new ForbiddenException('You are not participant in this game');
    return this.viewModelMapper.getGameViewModel(game);
  }

  @Post('connection')
  @HttpCode(200)
  async createGameOrConnectToExist(@CurrentUserId() currentUserId: number): Promise<GamePairViewModel> {
    const newGame = await this.commandBus.execute(new CreateOrConnectToGameCommand(currentUserId));
    return this.viewModelMapper.getGameViewModel(newGame);
  }

  @Post('my-current/answers')
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
