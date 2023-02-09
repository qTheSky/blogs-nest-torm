import { INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from './utils/getAppAndCleanDB';
import * as request from 'supertest';
import { CreateUserModel } from '../src/users/models/CreateUserModel';
import { UserViewModel } from '../src/users/models/UserViewModel';
import { newUser } from './models-for-tests/positive/create/User';
import { superAdminBasicAuth } from './constants';
import { cleanDb } from './utils/cleanDb';
import { createCommonUser } from './utils/create-user-and-get-token/create-common-user';
import { BanUserModel } from '../src/super-admin/models/BanUserModel';
import { AuthCredentialsModel } from '../src/auth/models/AuthCredentialsModel';
import { getCreateModels } from './utils/get-create-models';
import { createManyItemsToDb } from './utils/create-many-items-to-db';
import { PaginatorWithItems } from '../src/common/paginator-response-type';

describe('/sa/users', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  describe('/create user', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    it('should create user', () => {
      return request(app.getHttpServer())
        .post('/sa/users')
        .send(newUser as CreateUserModel)
        .set('Authorization', superAdminBasicAuth)
        .expect(201)
        .then(({ body }) => {
          expect(body).toEqual({
            email: newUser.email,
            login: newUser.login,
            id: expect.any(String),
            createdAt: expect.any(String),
            banInfo: { isBanned: false, banDate: null, banReason: null },
          } as UserViewModel);
        });
    });

    it('shouldnt create user with the same credentials', () => {
      return request(app.getHttpServer())
        .post('/sa/users')
        .send(newUser as CreateUserModel)
        .set('Authorization', superAdminBasicAuth)
        .expect(400);
    });
  });
  describe('/delete user', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    it('should create and delete user', async () => {
      const user = await createCommonUser(app);
      await request(app.getHttpServer())
        .delete('/sa/users/' + user.id)
        .set('Authorization', superAdminBasicAuth)
        .expect(204);
      await request(app.getHttpServer())
        .delete('/sa/users/' + user.id)
        .set('Authorization', superAdminBasicAuth)
        .expect(404);
    });
  });
  describe('/ban USER', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    let bannedUser;
    it('should ban user', async () => {
      bannedUser = await createCommonUser(app);
      return request(app.getHttpServer())
        .put(`/sa/users/${bannedUser.id}/ban`)
        .send({ banReason: 'BAN REASON !!!!!!!!!!!!!', isBanned: true } as BanUserModel)
        .set('Authorization', superAdminBasicAuth)
        .expect(204);
    });
    it('banned user cant log in', async () => {
      return request(app.getHttpServer())
        .post(`/auth/login`)
        .send({ loginOrEmail: bannedUser.email, password: newUser.password } as AuthCredentialsModel)
        .expect(401);
    });
    it('should unban user', async () => {
      return request(app.getHttpServer())
        .put(`/sa/users/${bannedUser.id}/ban`)
        .send({ banReason: 'BAN REASON !!!!!!!!!!!!!', isBanned: false } as BanUserModel)
        .set('Authorization', superAdminBasicAuth)
        .expect(204);
    });
    it('unbanned user can log in', async () => {
      return request(app.getHttpServer())
        .post(`/auth/login`)
        .send({ loginOrEmail: bannedUser.email, password: newUser.password } as AuthCredentialsModel)
        .expect(200);
    });
  });
  describe('/get users', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });

    it('should create 12 users', async () => {
      const uniqueEmails = [];
      for (let i = 0; i < 12; i++) {
        uniqueEmails.push(`goodEmail${i + 1}@mail.ru`);
      }
      const models = getCreateModels<CreateUserModel>(
        12,
        { email: '', login: '', password: '123456789' },
        'login',
        'email',
        uniqueEmails,
      );
      await createManyItemsToDb<CreateUserModel>(app, 12, models);
    });

    it('should check query users params', () => {
      return request(app.getHttpServer())
        .get(
          '/sa/users?' +
            'searchLoginTerm=va&' +
            'searchEmailTerm=goodEmail7&' +
            'pageNumber=2&' +
            'pageSize=3&' +
            'sortDirection=asc',
        )
        .set('Authorization', superAdminBasicAuth)
        .expect(200)
        .then(({ body }) => {
          expect(body.items.length).toBe(1);
          expect(body).toEqual({
            ...PaginatorWithItems,
            pageSize: 3,
            page: 2,
            pagesCount: 2,
            totalCount: 4,
            items: expect.any(Array),
          });
          expect(body.items[0].login).toBe('Vandam');
        });
    });
  });
});
