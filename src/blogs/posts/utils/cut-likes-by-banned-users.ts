import { Like } from '../common/like.entity';

export const cutLikesByBannedUsers = <LIKETYPE extends Like>(likes: LIKETYPE[]): LIKETYPE[] =>
  likes.filter((l) => !l.user.banInfo.isBanned);
