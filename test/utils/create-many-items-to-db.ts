import { INestApplication } from '@nestjs/common';
import { superAdminBasicHeader } from '../constants';
import request from 'supertest';

export const createManyItemsToDb = async <M extends object>(
  app: INestApplication,
  endPoint: string,
  howManyItems: number,
  createModels: M[],
  accessToken?: string,
): Promise<{ someViewModels: any[] }> => {
  const authHeader = accessToken ? `Bearer ${accessToken}` : superAdminBasicHeader;
  const requestBodies: object[] = [];
  for (let i = 0; i < howManyItems; i++) {
    await request(app.getHttpServer())
      .post(endPoint)
      .send(createModels[i])
      .set('Authorization', authHeader)
      .expect(201)
      .then(({ body }) => {
        requestBodies.push(body);
      });
  }
  return { someViewModels: requestBodies };
};
