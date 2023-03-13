import { BlogViewModel } from '../../../../blogs/models/BlogViewModel';

export const blogViewModelExample: BlogViewModel = {
  id: 'string',
  name: 'string',
  description: 'string',
  websiteUrl: 'string',
  createdAt: '2023-03-13T11:10:21.007Z',
  isMembership: false,
  images: {
    wallpaper: { url: 'string', width: 0, height: 0, fileSize: 0 },
    main: [{ url: 'string', width: 0, height: 0, fileSize: 0 }],
  },
};
