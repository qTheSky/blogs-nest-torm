import { Types } from 'mongoose';

export type UserViewModel = {
  id: Types.ObjectId;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
};
