import { INestApplication } from '@nestjs/common';
import { UserViewModel } from '../../../src/users/models/UserViewModel';
import { createCommonUser } from './create-common-user';
import { makeCommonLogin } from './make-common-login';

export const createUserAndGetToken = async (app: INestApplication): Promise<{ user: UserViewModel; token: string }> => {
  const user = await createCommonUser(app);
  const accessToken = await makeCommonLogin(app);
  return { user, token: accessToken };
};
