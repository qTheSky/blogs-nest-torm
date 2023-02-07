import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { newUser } from '../../models-for-tests/positive/create/User';

export const makeCommonLogin = async (app: INestApplication): Promise<string> => {
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      loginOrEmail: newUser.email,
      password: newUser.password,
    })
    .expect(200);
  return loginResponse.body.accessToken;
};
