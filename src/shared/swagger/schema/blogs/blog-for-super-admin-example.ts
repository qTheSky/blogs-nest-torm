import { BlogForSAViewModel } from '../../../../blogs/models/BlogViewModel';
import { isoDateExample } from '../common/iso-date-example';

export const blogForSuperAdminExample: BlogForSAViewModel = {
  id: 'string',
  name: 'string',
  description: 'string',
  websiteUrl: 'string',
  createdAt: isoDateExample,
  isMembership: false,
  blogOwnerInfo: { userId: 'string', userLogin: 'string' },
  banInfo: { isBanned: true, banDate: isoDateExample },
};
