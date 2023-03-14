import { UserViewModel } from '../../../../users/models/UserViewModel';
import { isoDateExample } from '../common/iso-date-example';

export const userExample: UserViewModel = {
  id: 'string',
  login: 'string',
  email: 'string',
  createdAt: isoDateExample,
  banInfo: { isBanned: true, banDate: isoDateExample, banReason: 'string' },
};
