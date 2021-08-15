export type Image = { id: number; url: string };

export type ImageList = {
  images: Image[];
};

export type UploadedImage = {
  imageUrl: string;
};
