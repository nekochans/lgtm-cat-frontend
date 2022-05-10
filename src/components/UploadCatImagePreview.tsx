import type { VFC } from 'react';

type Props = {
  imagePreviewUrl: string;
};

const UploadCatImagePreview: VFC<Props> = ({ imagePreviewUrl }) => (
  <figure className="image">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={imagePreviewUrl} alt="uploadImagePreview" />
  </figure>
);

export default UploadCatImagePreview;
