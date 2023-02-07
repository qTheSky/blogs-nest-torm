import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/user.schema';

export const GetCurrentUserIdOrNull = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest();
  return request.user ? request.user._id : null;
});
