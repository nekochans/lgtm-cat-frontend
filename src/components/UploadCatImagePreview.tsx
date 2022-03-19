import React from 'react';

type Props = {
  imagePreviewUrl: string;
};

const UploadCatImagePreview: React.FC<Props> = ({ imagePreviewUrl }: Props) => (
  <figure className="image">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={imagePreviewUrl} alt="uploadImagePreview" />
  </figure>
);

export default UploadCatImagePreview;
