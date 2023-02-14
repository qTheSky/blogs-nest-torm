export interface BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export interface BlogForSAViewModel extends BlogViewModel {
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  banInfo: { isBanned: boolean; banDate: string | null };
}
