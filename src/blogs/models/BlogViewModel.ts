import { ImageViewModel } from './ImageViewModel';

export interface BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  images: {
    wallpaper: ImageViewModel | null;
    main: ImageViewModel[] | null;
  };
}

export interface BlogForSAViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  banInfo: { isBanned: boolean; banDate: string | null };
}
