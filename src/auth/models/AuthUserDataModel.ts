import { Types } from 'mongoose';

export interface AuthUserDataModel {
  email: string;
  login: string;
  userId: Types.ObjectId;
}
