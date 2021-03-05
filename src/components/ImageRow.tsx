import React from 'react';
import { Image } from '../domain/image';
import ImageContent from './ImageContent';

type Props = {
  imageList: Image[];
};

const ImageRow: React.FC<Props> = ({ imageList }: Props) => (
  <div className="columns">
    {imageList.map((image) => (
      <ImageContent image={image} key={image.id} />
    ))}
  </div>
);
export default ImageRow;
