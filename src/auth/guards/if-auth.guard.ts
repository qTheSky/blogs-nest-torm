import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
export class IfAuthGuard {
  constructor(private jwtService: JwtService, private usersRepository: UsersRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean | Promise<boolean> | Observable<boolean>> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      request.user = { _id: null };
      return true;
    }
    const accessToken = request.headers.authorization.split(' ')[1];

    try {
      const payload: any = this.jwtService.verify(accessToken);
      request.user = await this.usersRepository.findUserById(payload.userId);
    } catch (e) {
      request.user = null;
    }
    return true;
  }
}
