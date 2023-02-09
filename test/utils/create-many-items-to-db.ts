import { INestApplication } from '@nestjs/common';
import { superAdminBasicAuth } from '../constants';
import * as request from 'supertest';

export const createManyItemsToDb = async <M extends object>(
  app: INestApplication,
  howManyItems: number,
  createModels: M[],
  accessToken?: string,
) => {
  const authHeader = accessToken ? `Bearer ${accessToken}` : superAdminBasicAuth;
  for (let i = 0; i < howManyItems; i++) {
    await request(app.getHttpServer())
      .post('/sa/users')
      .send(createModels[i])
      .set('Authorization', authHeader)
      .expect(201);
  }
};
