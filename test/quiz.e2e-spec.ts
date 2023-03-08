import { INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from './utils/getAppAndCleanDB';
import { createTwoUsersAndGetTokens } from './utils/create-user-and-get-token/create-two-users';
import * as request from 'supertest';
import { UserViewModel } from '../src/users/models/UserViewModel';
import { GamePairViewModel, GameStatuses } from '../src/quiz/models/GameModels';
import { getCreateModels } from './utils/get-create-models';
import { CreateQuizQuestionModel } from '../src/super-admin/models/quiz/CreateQuizQuestionModel';
import { createManyItemsToDb } from './utils/create-many-items-to-db';
import { PublishQuestionModel } from '../src/super-admin/models/quiz/PublishQuestionModel';
import { superAdminBasicHeader } from './constants';
import { AnswerInputModel } from '../src/quiz/models/AnswerInputModel';
import { PaginatorResponseType } from '../src/shared/paginator-response-type';
import { maxQuestionsCount } from '../src/quiz/constants/maxQuestionsCount';
import { StatisticsViewModel } from '../src/quiz/models/StatisticsViewModel';

jest.setTimeout(15000);
describe('quiz e2e', () => {
  let app: INestApplication;
  let firstUser: UserViewModel; //qTheSky
  let firstUserToken: string; //zeska
  let secondUser: UserViewModel;
  let secondUserToken: string;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
    const { user1, user2 } = await createTwoUsersAndGetTokens(app);
    firstUser = user1.user;
    firstUserToken = user1.token;
    secondUser = user2.user;
    secondUserToken = user2.token;
  });

  let game: GamePairViewModel;
  it('should create five questions (with 111 or 222 as right answers) and publish them', async () => {
    //create questions
    const createQuizQuestionModels = getCreateModels<CreateQuizQuestionModel>(
      5,
      { body: 'no matter it will change to unique', correctAnswers: ['111', '222'] },
      'body',
    );
    for (let i = 0; i < createQuizQuestionModels.length; i++) {
      createQuizQuestionModels[i].body = createQuizQuestionModels[i].body + '**********';
    }
    const { someViewModels } = await createManyItemsToDb(app, '/sa/quiz/questions', 5, createQuizQuestionModels);
    //create questions
    //publish them
    for (let i = 0; i < someViewModels.length; i++) {
      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${someViewModels[i].id}/publish`)
        .send({ published: true } as PublishQuestionModel)
        .set('Authorization', superAdminBasicHeader)
        .expect(204);
    }
    //publish them
  });
  it('should create new game', async () => {
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .send({})
      .expect(200)
      .then(({ body }) => {
        game = body;
        expect(body).toEqual({
          id: expect.any(String),
          firstPlayerProgress: {
            answers: expect.any(Array),
            player: { id: firstUser.id, login: firstUser.login },
            score: 0,
          },
          secondPlayerProgress: null,
          status: 'PendingSecondPlayer',
          startGameDate: null,
          pairCreatedDate: expect.any(String),
          finishGameDate: null,
          questions: null,
        } as GamePairViewModel);
      });
  });
  let questions;
  it('second user should connect to active game', async () => {
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .send({})
      .expect(200)
      .then(({ body }) => {
        questions = body.questions;
        expect(body).toEqual({
          id: expect.any(String),
          firstPlayerProgress: {
            answers: expect.any(Array),
            player: { id: firstUser.id, login: firstUser.login },
            score: 0,
          },
          secondPlayerProgress: {
            answers: expect.any(Array),
            player: { id: secondUser.id, login: secondUser.login },
            score: 0,
          },
          status: 'Active',
          startGameDate: expect.any(String),
          pairCreatedDate: expect.any(String),
          finishGameDate: null,
          questions: expect.any(Array),
        } as GamePairViewModel);
      });
  });
  it('those two players shouldn`t create new game coz they have active game', async () => {
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .send({})
      .expect(403);
  });
  it('those two players shouldn`t create new game coz they have active game', async () => {
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .send({})
      .expect(403);
  });
  it('should return current game for user', async () => {
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my-current`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          id: game.id,
          status: 'Active',
          pairCreatedDate: expect.any(String),
          finishGameDate: null,
          startGameDate: expect.any(String),
          questions: expect.any(Array),
          firstPlayerProgress: {
            player: { id: firstUser.id, login: firstUser.login },
            score: 0,
            answers: expect.any(Array),
          },
          secondPlayerProgress: {
            player: { id: secondUser.id, login: secondUser.login },
            score: 0,
            answers: expect.any(Array),
          },
        } as GamePairViewModel);
      });
  });
  it('1 player should answer to all questions correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${firstUserToken}`)
        .send({ answer: '111' } as AnswerInputModel)
        .expect(200);
    }
  });
  it('should return game by id for two users', async () => {
    //get by second user
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game.id}`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          id: game.id,
          status: 'Active',
          startGameDate: expect.any(String),
          finishGameDate: null,
          pairCreatedDate: game.pairCreatedDate,
          questions: expect.any(Array),
          firstPlayerProgress: {
            player: { id: firstUser.id, login: firstUser.login },
            score: 5, //5 coz above first user answered to all questions
            answers: expect.any(Array),
          },
          secondPlayerProgress: {
            player: { id: secondUser.id, login: secondUser.login },
            score: 0,
            answers: expect.any(Array),
          },
        } as GamePairViewModel);
      });
    //get by second user
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game.id}`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          id: game.id,
          status: 'Active',
          startGameDate: expect.any(String),
          finishGameDate: null,
          pairCreatedDate: game.pairCreatedDate,
          questions: expect.any(Array),
          firstPlayerProgress: {
            player: { id: firstUser.id, login: firstUser.login },
            score: 5, //5 coz above first user answered to all questions
            answers: expect.any(Array),
          },
          secondPlayerProgress: {
            player: { id: secondUser.id, login: secondUser.login },
            score: 0,
            answers: expect.any(Array),
          },
        } as GamePairViewModel);
      });
  });
  it('2 player should answer to all questions correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ answer: '111' } as AnswerInputModel)
        .expect(200);
    }
  });
  it('game should be finished and 1 user should have score:6 because he finished first', async () => {
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game.id}`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          id: game.id,
          status: 'Finished',
          pairCreatedDate: expect.any(String),
          finishGameDate: expect.any(String),
          startGameDate: expect.any(String),
          questions: expect.any(Array),
          firstPlayerProgress: {
            answers: expect.any(Array),
            score: 6,
            player: { id: firstUser.id, login: firstUser.login },
          },
          secondPlayerProgress: {
            answers: expect.any(Array),
            score: 5,
            player: { id: secondUser.id, login: secondUser.login },
          },
        } as GamePairViewModel);
      });
  });
  it('should create new game by first user and second user should connect to new game', async () => {
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .send({})
      .expect(200);
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .send({})
      .expect(200);
  });
  it('first player should get all games with paging', async () => {
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          totalCount: 2,
          page: 1,
          pageSize: 10,
          pagesCount: 1,
          items: [
            {
              id: expect.any(String),
              status: GameStatuses.ACTIVE,
              startGameDate: expect.any(String),
              finishGameDate: null,
              pairCreatedDate: expect.any(String),
              questions: expect.any(Array),
              firstPlayerProgress: {
                score: 0,
                player: { id: firstUser.id, login: firstUser.login },
                answers: expect.any(Array),
              },
              secondPlayerProgress: {
                score: 0,
                player: { id: secondUser.id, login: secondUser.login },
                answers: expect.any(Array),
              },
            },
            {
              id: game.id,
              status: GameStatuses.FINISHED,
              startGameDate: expect.any(String),
              finishGameDate: expect.any(String),
              pairCreatedDate: expect.any(String),
              questions: expect.any(Array),
              firstPlayerProgress: {
                answers: expect.any(Array),
                score: 6,
                player: { id: firstUser.id, login: firstUser.login },
              },
              secondPlayerProgress: {
                answers: expect.any(Array),
                score: 5,
                player: { id: secondUser.id, login: secondUser.login },
              },
            },
          ],
        } as PaginatorResponseType<GamePairViewModel[]>);
      });
  });
});

describe('quiz game and get stats', () => {
  let app: INestApplication;
  let firstUser: UserViewModel; //qTheSky
  let firstUserToken: string; //zeska
  let secondUser: UserViewModel;
  let secondUserToken: string;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
    const { user1, user2 } = await createTwoUsersAndGetTokens(app);
    firstUser = user1.user;
    firstUserToken = user1.token;
    secondUser = user2.user;
    secondUserToken = user2.token;
  });
  it('should create five questions (with 111 or 222 as right answers) and publish them', async () => {
    //create questions
    const createQuizQuestionModels = getCreateModels<CreateQuizQuestionModel>(
      5,
      { body: 'no matter it will change to unique', correctAnswers: ['111', '222'] },
      'body',
    );
    for (let i = 0; i < createQuizQuestionModels.length; i++) {
      createQuizQuestionModels[i].body = createQuizQuestionModels[i].body + '**********';
    }
    const { someViewModels } = await createManyItemsToDb(app, '/sa/quiz/questions', 5, createQuizQuestionModels);
    //create questions
    //publish them
    for (let i = 0; i < someViewModels.length; i++) {
      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${someViewModels[i].id}/publish`)
        .send({ published: true } as PublishQuestionModel)
        .set('Authorization', superAdminBasicHeader)
        .expect(204);
    }
    //publish them
  });
  it('create 2 games and finish them. first user should answer first and 10 times correctly (12 scores)', async () => {
    await createNewGameByFirstUser(app, firstUserToken);
    await connectToGameBySecondUser(app, secondUserToken);
    await answerQuestionsByUser(app, firstUserToken);
    await answerQuestionsByUser(app, secondUserToken);
    await createNewGameByFirstUser(app, firstUserToken);
    await connectToGameBySecondUser(app, secondUserToken);
    await answerQuestionsByUser(app, firstUserToken);
    await answerQuestionsByUser(app, secondUserToken);
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/users/my-statistic`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          lossesCount: 0,
          winsCount: 2,
          drawsCount: 0,
          gamesCount: 2,
          sumScore: 12,
          avgScores: 6,
        } as StatisticsViewModel);
      });
  });
});

async function createNewGameByFirstUser(app: INestApplication, firstUserToken: string) {
  await request(app.getHttpServer())
    .post(`/pair-game-quiz/pairs/connection`)
    .set('Authorization', `Bearer ${firstUserToken}`)
    .send({})
    .expect(200);
}

async function connectToGameBySecondUser(app: INestApplication, secondUserToken: string) {
  await request(app.getHttpServer())
    .post(`/pair-game-quiz/pairs/connection`)
    .set('Authorization', `Bearer ${secondUserToken}`)
    .send({})
    .expect(200);
}

async function answerQuestionsByUser(app: INestApplication, token: string) {
  for (let i = 0; i < maxQuestionsCount; i++) {
    await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/my-current/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({ answer: '111' } as AnswerInputModel)
      .expect(200);
  }
}
