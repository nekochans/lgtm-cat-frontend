import { LgtmImages } from '../domain/types/lgtmImage';

import ImageContent from './ImageContent';

import type { VFC } from 'react';

type Props = LgtmImages;

const ImageRow: VFC<Props> = ({ lgtmImages }) => (
  <div className="columns">
    {lgtmImages.map((image) => (
      <ImageContent image={image} key={image.id} />
    ))}
  </div>
);
export default ImageRow;
