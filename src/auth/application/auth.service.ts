import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { RefreshPayload } from '../jwt.payloads';
import { UsersRepo } from '../../users/users.repo';
import { RefreshTokenBlackListRepo } from '../../security/refreshTokenBlackList.repo';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepo: UsersRepo,
    private refreshTokenBlackListRepo: RefreshTokenBlackListRepo,
  ) {}

  async generateTokens(userId: number, deviceId?: string) {
    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = this.jwtService.sign(
      { userId, deviceId: deviceId || randomUUID() },
      { expiresIn: process.env.REFRESH_TOKEN_TIME },
    );
    return { accessToken, refreshToken };
  }

  getUserIdByTokenOrThrow(token: string) {
    try {
      const payload: any = this.jwtService.verify(token);
      return payload.userId;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }

  async putRefreshTokenToBlackList(refreshToken: string): Promise<RefreshPayload> {
    const { exp, userId, deviceId, iat } = this.jwtService.decode(refreshToken) as RefreshPayload;
    const user = await this.usersRepo.findUserById(+userId);
    await this.refreshTokenBlackListRepo.create(user, refreshToken, +userId, exp);
    return { iat, exp, userId, deviceId };
  }

  async checkIsRefreshTokenInBlackList(userId: number, refreshToken: string): Promise<boolean> {
    const foundRefreshToken = await this.refreshTokenBlackListRepo.findRefreshToken(userId, refreshToken);
    if (foundRefreshToken) throw new UnauthorizedException();
    return !!foundRefreshToken;
  }

  async generateHash(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
