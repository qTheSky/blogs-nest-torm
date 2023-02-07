import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument, SessionModel } from './session.schema';
import { Types } from 'mongoose';

@Injectable()
export class SessionsRepository {
  constructor(@InjectModel(Session.name) private SessionModel: SessionModel) {}

  async create(session: Session): Promise<Session> {
    const newSession = new this.SessionModel(session);
    return await newSession.save();
  }

  async findAllSessionsOfUser(userId: Types.ObjectId): Promise<Session[]> {
    return this.SessionModel.find({ userId }).lean();
  }

  async findSessionByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ deviceId });
  }

  async deleteSessionByDeviceId(deviceId: string) {
    return this.SessionModel.deleteOne({ deviceId });
  }

  async deleteSessionsExceptCurrent(userId: Types.ObjectId, currentDeviceId: string): Promise<boolean> {
    const deleteFilter = { userId, deviceId: { $ne: currentDeviceId } };
    const result = await this.SessionModel.deleteMany(deleteFilter);
    return !!result.deletedCount;
  }
  async deleteAllSessionsOfUser(userId: Types.ObjectId) {
    return this.SessionModel.deleteMany({ userId });
  }

  async save(session: SessionDocument): Promise<SessionDocument> {
    return await session.save();
  }
}
