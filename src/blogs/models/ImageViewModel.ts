export type ImageViewModel = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
};

export type UploadedImageViewModel = {
  wallpaper: ImageViewModel | null;
  main: ImageViewModel[] | null;
};
