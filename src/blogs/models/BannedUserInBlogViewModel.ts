import { Types } from 'mongoose';

export type BannedUserInBlogViewModel = {
  id: Types.ObjectId;
  login: string;
  banInfo: { isBanned: boolean; banDate: string; banReason: string };
};
