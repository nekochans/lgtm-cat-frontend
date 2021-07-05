import React from 'react';

type Props = {
  imagePreviewUrl: string;
};

const UploadCatImagePreview: React.FC<Props> = ({ imagePreviewUrl }: Props) => (
  <figure className="image is-square">
    <img src={imagePreviewUrl} alt="uploadImagePreview" />
  </figure>
);

export default UploadCatImagePreview;
