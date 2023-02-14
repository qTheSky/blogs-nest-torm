import { Like } from '../common/like.entity';

export const cutLikesByBannedUsers = <TL extends Like>(likes: TL[]): TL[] =>
  likes.filter((l) => !l.user.banInfo.isBanned);
