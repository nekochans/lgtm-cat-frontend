import React from 'react';
import { LgtmImages } from '../domain/types/lgtmImage';
import ImageContent from './ImageContent';

type Props = LgtmImages;

const ImageRow: React.FC<Props> = ({ lgtmImages }: Props) => (
  <div className="columns">
    {lgtmImages.map((image) => (
      <ImageContent image={image} key={image.id} />
    ))}
  </div>
);
export default ImageRow;
