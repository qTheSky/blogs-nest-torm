import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenBlackListRepository } from '../refreshTokenBlackList.repository';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { RefreshPayload } from '../jwt.payloads';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private refreshTokenBlackListRepository: RefreshTokenBlackListRepository,
  ) {}

  async generateTokens(userId: Types.ObjectId, deviceId?: string) {
    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = this.jwtService.sign(
      { userId, deviceId: deviceId || randomUUID() },
      { expiresIn: process.env.REFRESH_TOKEN_TIME },
    );
    return { accessToken, refreshToken };
  }

  getUserIdByTokenOrThrow(token: string): Types.ObjectId {
    try {
      const payload: any = this.jwtService.verify(token);
      return new Types.ObjectId(payload.userId);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }

  async putRefreshTokenToBlackList(refreshToken: string): Promise<RefreshPayload> {
    const { exp, userId, deviceId, iat } = this.jwtService.decode(refreshToken) as RefreshPayload;
    await this.refreshTokenBlackListRepository.create(refreshToken, new Types.ObjectId(userId), exp);
    return { iat, exp, userId, deviceId };
  }

  async checkIsRefreshTokenInBlackList(userId: Types.ObjectId, refreshToken: string): Promise<boolean> {
    const foundRefreshToken = await this.refreshTokenBlackListRepository.findRefreshToken(userId, refreshToken);
    if (foundRefreshToken) throw new UnauthorizedException();
    return !!foundRefreshToken;
  }

  async generateHash(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
