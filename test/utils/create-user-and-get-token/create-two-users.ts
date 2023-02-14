import { INestApplication } from '@nestjs/common';
import { createCommonUser } from './create-common-user';
import { makeCommonLoginAndGetToken } from './make-common-login';
import * as request from 'supertest';
import { CreateUserModel } from '../../../src/users/models/CreateUserModel';
import { UserViewModel } from '../../../src/users/models/UserViewModel';

export const createTwoUsersAndGetTokens = async (
  app: INestApplication,
): Promise<{ user1: { user: UserViewModel; token: string }; user2: { user: UserViewModel; token: string } }> => {
  const user1 = await createCommonUser(app);
  const accessToken1 = await makeCommonLoginAndGetToken(app);
  let user2;
  let accessToken2;
  await request(app.getHttpServer())
    .post('/sa/users')
    .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
    .send({ email: 'wsdasav.mic@yandex.ru', password: '123456789Qq', login: 'zeska' } as CreateUserModel)
    .expect(201)
    .then(({ body }) => {
      user2 = body;
    });
  await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      loginOrEmail: 'zeska',
      password: '123456789Qq',
    })
    .expect(200)
    .then(({ body }) => {
      accessToken2 = body.accessToken;
    });
  return { user1: { user: user1, token: accessToken1 }, user2: { user: user2, token: accessToken2 } };
};
