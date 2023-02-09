import { INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from './utils/getAppAndCleanDB';
import { cleanDb } from './utils/cleanDb';
import { createUserAndGetTokens } from './utils/create-user-and-get-token/create-user-and-get-token';
import * as request from 'supertest';
import { SessionViewModel } from '../src/security/models/SessionViewModel';
import {
  makeCommonLoginAndGetToken,
  makeCommonLoginAndGetTokens,
} from './utils/create-user-and-get-token/make-common-login';

describe('/security/devices', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  describe('crud devices', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    let session1: SessionViewModel;
    let refreshToken1: string;
    it('should create user make login and get his the only one device', async () => {
      const { user, refreshToken, accessToken } = await createUserAndGetTokens(app);
      refreshToken1 = refreshToken;
      return request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', `refreshToken=${refreshToken1}`)
        .expect(200)
        .then(({ body }) => {
          session1 = body[0];
          expect(body[0]).toEqual({
            ip: expect.any(String),
            deviceId: expect.any(String),
            lastActiveDate: expect.any(String),
            title: expect.any(String),
          } as SessionViewModel);
        });
    });
    it('should delete session created above', async () => {
      return request(app.getHttpServer())
        .delete(`/security/devices/${session1.deviceId}`)
        .set('Cookie', `refreshToken=${refreshToken1}`)
        .expect(204);
    });
    it('should make 3 logins delete all sessions except current and get only 1 session', async () => {
      //make 3 logins
      await makeCommonLoginAndGetToken(app);
      await makeCommonLoginAndGetToken(app);
      const { accessToken, refreshToken } = await makeCommonLoginAndGetTokens(app);
      //make 3 logins
      //get 3 sessions
      await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200)
        .then(({ body }) => {
          expect(body.length).toBe(3);
        });
      //get 3 sessions
      //delete sessions except current
      await request(app.getHttpServer())
        .delete(`/security/devices`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(204);
      //delete sessions except current
      //get 1 session
      return request(app.getHttpServer())
        .get(`/security/devices`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200)
        .then(({ body }) => {
          expect(body.length).toBe(1);
        });
      //get 1 session
    });
  });
});
