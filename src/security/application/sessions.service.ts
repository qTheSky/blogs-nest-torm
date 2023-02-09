import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshPayload } from '../../auth/jwt.payloads';
import { SessionsRepo } from '../sessions.repo';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class SessionsService {
  constructor(private jwtService: JwtService, private sessionsRepo: SessionsRepo) {}

  async createSession(
    user: User,
    sessionData: { ip: string; deviceName: string; userId: number },
    refreshToken: string,
  ) {
    const decodedRefreshToken = this.jwtService.decode(refreshToken) as RefreshPayload;

    await this.sessionsRepo.create(user, {
      decodedRefreshToken,
      refreshToken,
      ip: sessionData.ip,
      deviceName: sessionData.deviceName || 'unknown',
    });
  }

  async deleteSessionByDeviceId(deviceId: string, userId: number) {
    const session = await this.sessionsRepo.findSessionByDeviceId(deviceId);
    if (!session) throw new NotFoundException('Session with this id doesnt exist');
    if (session.userId !== userId) throw new ForbiddenException('You cant delete not your own session');
    await this.sessionsRepo.deleteSessionByDeviceId(deviceId);
  }

  async updateSessionDates(refreshToken: string) {
    // when refresh token
    const { iat, exp, deviceId } = this.jwtService.decode(refreshToken) as RefreshPayload;
    const session = await this.sessionsRepo.findSessionByDeviceId(deviceId);
    session.issuedAt = new Date(iat * 1000);
    session.expiresIn = new Date(exp * 1000);
    session.refreshToken = refreshToken;
    await this.sessionsRepo.save(session);
  }
}
