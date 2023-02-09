import { INestApplication } from '@nestjs/common';
import { UserViewModel } from '../../../src/users/models/UserViewModel';
import { createCommonUser } from './create-common-user';
import { makeCommonLoginAndGetToken, makeCommonLoginAndGetTokens } from './make-common-login';

export const createUserAndGetAccessToken = async (
  app: INestApplication,
): Promise<{ user: UserViewModel; token: string }> => {
  const user = await createCommonUser(app);
  const accessToken = await makeCommonLoginAndGetToken(app);
  return { user, token: accessToken };
};
export const createUserAndGetTokens = async (
  app: INestApplication,
): Promise<{ user: UserViewModel; accessToken: string; refreshToken: string }> => {
  const user = await createCommonUser(app);
  const { accessToken, refreshToken } = await makeCommonLoginAndGetTokens(app);
  return { user, accessToken, refreshToken };
};
