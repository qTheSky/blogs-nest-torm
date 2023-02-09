import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshPayload } from '../auth/jwt.payloads';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class SessionsRepo {
  constructor(@InjectRepository(Session) private readonly sessionsRepository: Repository<Session>) {}

  async create(
    user: User,
    dto: { decodedRefreshToken: RefreshPayload; ip: string; deviceName: string; refreshToken: string },
  ): Promise<Session> {
    const session = new Session();
    session.issuedAt = new Date(dto.decodedRefreshToken.iat * 1000);
    session.expiresIn = new Date(dto.decodedRefreshToken.exp * 1000);
    session.ip = dto.ip;
    session.deviceName = dto.deviceName;
    session.deviceId = dto.decodedRefreshToken.deviceId;
    session.refreshToken = dto.refreshToken;
    session.user = user;

    return await this.save(session);
  }

  async deleteAllSessionsOfUser(userId: number) {
    return this.sessionsRepository.delete({ userId });
  }

  async deleteSessionByDeviceId(deviceId: string) {
    return this.sessionsRepository.delete({ deviceId });
  }

  async deleteSessionsExceptCurrent(userId: number, currentDeviceId: string) {
    return this.sessionsRepository.delete({ userId, deviceId: Not(currentDeviceId) });
  }

  async findAllSessionsOfUser(userId: number): Promise<Session[]> {
    return this.sessionsRepository.findBy({ userId });
  }

  async findSessionByDeviceId(deviceId: string): Promise<Session> {
    return this.sessionsRepository.findOneBy({ deviceId });
  }

  async save(session: Session): Promise<Session> {
    return await this.sessionsRepository.save(session);
  }
}
