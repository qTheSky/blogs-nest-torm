import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { newUser } from '../../models-for-tests/positive/create/User';

export const createCommonUser = async (app: INestApplication) => {
  const { body } = await request(app.getHttpServer())
    .post('/sa/users')
    .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
    .send(newUser)
    .expect(201);
  return body;
};
