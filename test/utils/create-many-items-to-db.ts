import { INestApplication } from '@nestjs/common';
import { superAdminBasicHeader } from '../constants';
import * as request from 'supertest';

export const createManyItemsToDb = async <M extends object>(
  app: INestApplication,
  endPoint: string,
  howManyItems: number,
  createModels: M[],
  accessToken?: string,
) => {
  const authHeader = accessToken ? `Bearer ${accessToken}` : superAdminBasicHeader;
  for (let i = 0; i < howManyItems; i++) {
    await request(app.getHttpServer())
      .post(endPoint)
      .send(createModels[i])
      .set('Authorization', authHeader)
      .expect(201);
  }
};
