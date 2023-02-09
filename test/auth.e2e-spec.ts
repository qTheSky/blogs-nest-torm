import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateUserModel } from '../src/users/models/CreateUserModel';
import { randomUUID } from 'crypto';
import { AuthCredentialsModel } from '../src/auth/models/AuthCredentialsModel';
import { newUser } from './models-for-tests/positive/create/User';
import { createCommonUser } from './utils/create-user-and-get-token/create-common-user';
import { getAppAndCleanDB } from './utils/getAppAndCleanDB';
import { cleanDb } from './utils/cleanDb';
import { createUserAndGetTokens } from './utils/create-user-and-get-token/create-user-and-get-token';
import { EmailResendModel } from '../src/auth/models/EmailResendModel';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  describe('/registration', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    const user1Email = 'smirnov.mic@yandex.ru';
    const user1Login = 'qTheSky';
    const busyUserEmail = user1Email;
    const busyUserLogin = user1Login;

    it('should register new user and send code verification', () => {
      const userData: CreateUserModel = {
        password: '123456789Qqqq',
        email: user1Email,
        login: user1Login,
      };
      return request(app.getHttpServer()).post('/auth/registration').send(userData).expect(HttpStatus.NO_CONTENT);
    });
    it('shouldnt register new user with duplicate email', () => {
      const userData: CreateUserModel = {
        password: '123456789Qqqq',
        email: busyUserEmail,
        login: randomUUID(),
      };
      return request(app.getHttpServer()).post('/auth/registration').send(userData).expect(HttpStatus.BAD_REQUEST);
    });
    it('shouldnt register new user with duplicate login', () => {
      const userData: CreateUserModel = {
        password: '123456789Qqqq',
        email: 'nomatter@nomatter.com',
        login: busyUserLogin,
      };
      return request(app.getHttpServer()).post('/auth/registration').send(userData).expect(HttpStatus.BAD_REQUEST);
    });
  });
  describe('/login', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    it('should create new user by admin and logged in with his credentials', async () => {
      await createCommonUser(app);
      const credentials1: AuthCredentialsModel = {
        password: newUser.password,
        loginOrEmail: newUser.email,
      };
      const credentials2: AuthCredentialsModel = {
        password: newUser.password,
        loginOrEmail: newUser.login,
      };
      const response1 = await request(app.getHttpServer()).post('/auth/login').send(credentials1);
      expect(response1.body).toEqual({ accessToken: expect.any(String) });
      const response2 = await request(app.getHttpServer()).post('/auth/login').send(credentials2);
      expect(response2.body).toEqual({ accessToken: expect.any(String) });
      expect(response2.headers['set-cookie'][0]).toEqual(expect.stringContaining('refreshToken='));
    });
  });
  describe('/me', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    it('me request should return correct user data', async () => {
      const createdUser = await createCommonUser(app);
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: newUser.password, loginOrEmail: newUser.email });
      const accessToken = loginResponse.body.accessToken;
      const meResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('authorization', `bearer ${accessToken}`)
        .expect(200);
      expect(meResponse.body.email).toBe(newUser.email);
      expect(meResponse.body.login).toBe(newUser.login);
      expect(meResponse.body.userId).toBe(createdUser.id);
    });
  });
  describe('/logout', () => {
    let refreshToken1;
    beforeAll(async () => {
      await cleanDb(app);
      const { accessToken, refreshToken, user } = await createUserAndGetTokens(app);
      refreshToken1 = refreshToken;
    });
    it('should logout user', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken1}`)
        .expect(204);
    });
    it('shouldnt logout second time the same refreshToken', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken1}`)
        .expect(401);
    });
  });
  describe('/refresh-token', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });

    it('should get 2 new tokens', async () => {
      const { accessToken, refreshToken, user } = await createUserAndGetTokens(app);
      const response = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);
      expect(response.body.accessToken).toEqual(expect.stringContaining('.'));
      expect(response.headers['set-cookie'][0]).not.toEqual(`refreshToken=${refreshToken}`);
    });
  });

  describe('/email-resending', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    it('should register user and resend email for him', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send(newUser as CreateUserModel)
        .expect(204);

      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({ email: newUser.email } as EmailResendModel)
        .expect(204);
    });
  });
});
