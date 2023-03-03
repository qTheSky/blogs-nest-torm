import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenBL } from './entities/refreshTokenBlackList.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class RefreshTokenBlackListRepo {
  constructor(@InjectRepository(RefreshTokenBL) private readonly repo: Repository<RefreshTokenBL>) {}
  async create(user: UserEntity, refreshToken: string, userId: number, exp: number) {
    const newDocument = new RefreshTokenBL();
    newDocument.refreshToken = refreshToken;
    newDocument.userId = userId;
    newDocument.expiresIn = exp;

    newDocument.user = user;
    return this.repo.save(newDocument);
  }

  async findRefreshToken(userId: number, refreshToken: string): Promise<RefreshTokenBL | null> {
    return this.repo.findOneBy({ userId, refreshToken });
  }
}
