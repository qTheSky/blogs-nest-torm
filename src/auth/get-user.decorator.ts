import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserIdOrNull = createParamDecorator((data: unknown, ctx: ExecutionContext): number | null => {
  const request = ctx.switchToHttp().getRequest();
  return request.user ? request.user.id : null;
});
