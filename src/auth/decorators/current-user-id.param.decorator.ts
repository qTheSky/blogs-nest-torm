import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';

export const CurrentUserId = createParamDecorator((data: unknown, context: ExecutionContext): Types.ObjectId => {
  const request = context.switchToHttp().getRequest();
  if (!request.user?.id) throw new Error('JwtGuard must be used');
  return request.user.id as Types.ObjectId;
});
