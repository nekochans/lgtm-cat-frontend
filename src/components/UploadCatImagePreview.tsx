import React from 'react';

type Props = {
  imagePreviewUrl: string;
};

const UploadCatImagePreview: React.FC<Props> = ({ imagePreviewUrl }: Props) => (
  <img src={imagePreviewUrl} alt="uploadImagePreview" />
);

export default UploadCatImagePreview;
