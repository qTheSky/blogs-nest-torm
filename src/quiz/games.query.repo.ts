import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEntity } from './entities/game.entity';
import { Repository } from 'typeorm';
import { NormalizedQuizGamesQuery } from '../common/query-normalizer';
import { PlayerEntity } from './entities/player.entity';
import { GamePairViewModel } from './models/GameModels';
import { ViewModelMapper } from '../common/view-model-mapper';
import { PaginatorResponseType } from '../common/paginator-response-type';

@Injectable()
export class GamesQueryRepo {
  constructor(
    @InjectRepository(GameEntity) private readonly repo: Repository<GameEntity>,
    private readonly viewModelMapper: ViewModelMapper,
  ) {}

  async findGames(
    query: NormalizedQuizGamesQuery,
    userId: number, // : Promise<PaginatorResponseType<GamePairViewModel[]>>
  ) {
    const builder = this.repo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.players', 'player')
      .leftJoinAndSelect('player.user', 'user')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('player2.gameId')
          .from(PlayerEntity, 'player2')
          .where('player2.userId = :userId', { userId })
          .getQuery();

        return 'game.id IN ' + subQuery;
      })
      .orderBy(`game.${query.sortBy}`, query.sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('player.connectedAt', 'ASC'); // players in game should be sorted by connectedAt by default

    const [games, total] = await builder
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getManyAndCount();

    // return {
    //   pagesCount: Math.ceil(total / query.pageSize),
    //   page: query.pageNumber,
    //   pageSize: query.pageSize,
    //   totalCount: total,
    //   items: games.map(this.viewModelMapper.getGameViewModel.bind(this.viewModelMapper)),
    // };
    return {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        {
          id: '68',
          firstPlayerProgress: { answers: [], score: 0, player: { id: '55', login: '2459lg' } },
          secondPlayerProgress: { answers: [], score: 0, player: { id: '54', login: '2458lg' } },
          status: 'Active',
          startGameDate: '2023-03-04T11:09:51.019Z',
          pairCreatedDate: '2023-03-04T11:09:49.001Z',
          finishGameDate: null,
          questions: [
            { id: '88', body: 'question body2 128833' },
            { id: '86', body: 'question body0 126453' },
            { id: '87', body: 'question body1 127639' },
            { id: '90', body: 'question body4 131242' },
            { id: '89', body: 'question body3 130048' },
          ],
        },
        {
          id: '67',
          firstPlayerProgress: {
            answers: [
              { addedAt: '2023-03-04T11:09:36.857Z', answerStatus: 'Correct', questionId: '90' },
              { addedAt: '2023-03-04T11:09:37.993Z', answerStatus: 'Incorrect', questionId: '88' },
              { addedAt: '2023-03-04T11:09:44.893Z', answerStatus: 'Correct', questionId: '86' },
              { addedAt: '2023-03-04T11:09:46.033Z', answerStatus: 'Correct', questionId: '87' },
              { addedAt: '2023-03-04T11:09:47.169Z', answerStatus: 'Incorrect', questionId: '89' },
            ],
            score: 3,
            player: { id: '55', login: '2459lg' },
          },
          secondPlayerProgress: {
            answers: [
              { addedAt: '2023-03-04T11:09:39.137Z', answerStatus: 'Correct', questionId: '90' },
              { addedAt: '2023-03-04T11:09:40.281Z', answerStatus: 'Incorrect', questionId: '88' },
              { addedAt: '2023-03-04T11:09:41.447Z', answerStatus: 'Incorrect', questionId: '86' },
              { addedAt: '2023-03-04T11:09:42.621Z', answerStatus: 'Incorrect', questionId: '87' },
              { addedAt: '2023-03-04T11:09:43.753Z', answerStatus: 'Incorrect', questionId: '89' },
            ],
            score: 2,
            player: { id: '54', login: '2458lg' },
          },
          status: 'Finished',
          startGameDate: '2023-03-04T11:09:35.036Z',
          pairCreatedDate: '2023-03-04T11:09:32.961Z',
          finishGameDate: '2023-03-04T08:17:24.718Z',
          questions: [
            { id: '90', body: 'question body4 131242' },
            { id: '88', body: 'question body2 128833' },
            { id: '86', body: 'question body0 126453' },
            { id: '87', body: 'question body1 127639' },
            { id: '89', body: 'question body3 130048' },
          ],
        },
        {
          id: '66',
          firstPlayerProgress: {
            answers: [
              { addedAt: '2023-03-04T11:09:19.085Z', answerStatus: 'Correct', questionId: '90' },
              { addedAt: '2023-03-04T11:09:20.225Z', answerStatus: 'Incorrect', questionId: '89' },
              { addedAt: '2023-03-04T11:09:28.862Z', answerStatus: 'Correct', questionId: '88' },
              { addedAt: '2023-03-04T11:09:29.998Z', answerStatus: 'Correct', questionId: '87' },
              { addedAt: '2023-03-04T11:09:31.141Z', answerStatus: 'Incorrect', questionId: '86' },
            ],
            score: 3,
            player: { id: '54', login: '2458lg' },
          },
          secondPlayerProgress: {
            answers: [
              { addedAt: '2023-03-04T11:09:21.369Z', answerStatus: 'Correct', questionId: '90' },
              { addedAt: '2023-03-04T11:09:22.505Z', answerStatus: 'Incorrect', questionId: '89' },
              { addedAt: '2023-03-04T11:09:25.417Z', answerStatus: 'Incorrect', questionId: '88' },
              { addedAt: '2023-03-04T11:09:26.585Z', answerStatus: 'Incorrect', questionId: '87' },
              { addedAt: '2023-03-04T11:09:27.721Z', answerStatus: 'Incorrect', questionId: '86' },
            ],
            score: 2,
            player: { id: '55', login: '2459lg' },
          },
          status: 'Finished',
          startGameDate: '2023-03-04T11:09:17.307Z',
          pairCreatedDate: '2023-03-04T11:09:15.261Z',
          finishGameDate: '2023-03-04T08:17:24.718Z',
          questions: [
            { id: '90', body: 'question body4 131242' },
            { id: '89', body: 'question body3 130048' },
            { id: '88', body: 'question body2 128833' },
            { id: '87', body: 'question body1 127639' },
            { id: '86', body: 'question body0 126453' },
          ],
        },
        {
          id: '65',
          firstPlayerProgress: {
            answers: [
              { addedAt: '2023-03-04T11:09:02.993Z', answerStatus: 'Correct', questionId: '87' },
              { addedAt: '2023-03-04T11:09:04.129Z', answerStatus: 'Incorrect', questionId: '90' },
              { addedAt: '2023-03-04T11:09:11.169Z', answerStatus: 'Correct', questionId: '88' },
              { addedAt: '2023-03-04T11:09:12.297Z', answerStatus: 'Correct', questionId: '86' },
              { addedAt: '2023-03-04T11:09:13.430Z', answerStatus: 'Incorrect', questionId: '89' },
            ],
            score: 3,
            player: { id: '54', login: '2458lg' },
          },
          secondPlayerProgress: {
            answers: [
              { addedAt: '2023-03-04T11:09:05.265Z', answerStatus: 'Correct', questionId: '87' },
              { addedAt: '2023-03-04T11:09:06.397Z', answerStatus: 'Incorrect', questionId: '90' },
              { addedAt: '2023-03-04T11:09:07.549Z', answerStatus: 'Incorrect', questionId: '88' },
              { addedAt: '2023-03-04T11:09:08.681Z', answerStatus: 'Incorrect', questionId: '86' },
              { addedAt: '2023-03-04T11:09:09.809Z', answerStatus: 'Incorrect', questionId: '89' },
            ],
            score: 2,
            player: { id: '55', login: '2459lg' },
          },
          status: 'Finished',
          startGameDate: '2023-03-04T11:09:01.119Z',
          pairCreatedDate: '2023-03-04T11:08:59.029Z',
          finishGameDate: '2023-03-04T08:17:24.718Z',
          questions: [
            { id: '87', body: 'question body1 127639' },
            { id: '90', body: 'question body4 131242' },
            { id: '88', body: 'question body2 128833' },
            { id: '86', body: 'question body0 126453' },
            { id: '89', body: 'question body3 130048' },
          ],
        },
      ],
    };
  }
}
