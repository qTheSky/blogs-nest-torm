import { BannedUserInBlogViewModel } from '../../../../blogs/models/BannedUserInBlogViewModel';
import { isoDateExample } from '../common/iso-date-example';

export const bannedUserInBlogExample: BannedUserInBlogViewModel = {
  id: 'string',
  login: 'string',
  banInfo: { isBanned: true, banDate: isoDateExample, banReason: 'string' },
};
