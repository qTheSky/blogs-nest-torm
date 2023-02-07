import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionsRepository } from './sessions.repository';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { RefreshPayload } from '../auth/jwt.payloads';
import { Session } from './session.schema';

@Injectable()
export class SessionsService {
  constructor(private sessionsRepository: SessionsRepository, private jwtService: JwtService) {}

  async createSession(
    sessionData: { ip: string; deviceName: string | undefined; userId: Types.ObjectId },
    refreshToken: string,
  ) {
    const decodedToken = this.jwtService.decode(refreshToken) as RefreshPayload;
    const newSession: Session = {
      _id: new Types.ObjectId(),
      issuedAt: new Date(decodedToken.iat * 1000),
      expiresIn: new Date(decodedToken.exp * 100),
      ip: sessionData.ip,
      deviceName: sessionData.deviceName || 'unknown',
      userId: new Types.ObjectId(decodedToken.userId),
      deviceId: decodedToken.deviceId,
      refreshToken,
    };
    await this.sessionsRepository.create(newSession);
  }

  async deleteSessionByDeviceId(deviceId: string, userId: Types.ObjectId) {
    const session = await this.sessionsRepository.findSessionByDeviceId(deviceId);
    if (!session) throw new NotFoundException('Session with this id doesnt exist');
    if (!userId.equals(session.userId)) throw new ForbiddenException('You cant delete not your own session');
    await this.sessionsRepository.deleteSessionByDeviceId(deviceId);
  }

  async deleteSessionsExceptCurrent(userId: Types.ObjectId, refreshToken: string) {
    const { deviceId } = this.jwtService.decode(refreshToken) as RefreshPayload;
    await this.sessionsRepository.deleteSessionsExceptCurrent(userId, deviceId);
  }

  async updateSessionDates(refreshToken: string) {
    const { iat, exp, deviceId } = this.jwtService.decode(refreshToken) as RefreshPayload;
    const session = await this.sessionsRepository.findSessionByDeviceId(deviceId);
    session.issuedAt = new Date(iat * 1000);
    session.expiresIn = new Date(exp * 1000);
    session.refreshToken = refreshToken;
    await this.sessionsRepository.save(session);
  }
}
