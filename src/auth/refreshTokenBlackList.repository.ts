import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshTokenBL, RefreshTokenBLModel } from './refreshTokenBlackList.schema';
import { Types } from 'mongoose';

@Injectable()
export class RefreshTokenBlackListRepository {
  constructor(@InjectModel(RefreshTokenBL.name) private RefreshTokenBLModel: RefreshTokenBLModel) {}

  async create(refreshToken: string, userId: Types.ObjectId, exp: number) {
    const newDocument = new this.RefreshTokenBLModel();
    newDocument.refreshToken = refreshToken;
    newDocument.userId = userId;
    newDocument.exp = exp;
    return await newDocument.save();
  }

  async findRefreshToken(userId: Types.ObjectId, refreshToken: string): Promise<RefreshTokenBL | null> {
    return this.RefreshTokenBLModel.findOne().and([{ userId }, { refreshToken }]);
  }
}
