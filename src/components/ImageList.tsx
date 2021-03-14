import React from 'react';
import ImageRow from './ImageRow';
import { Image } from '../domain/image';

type Props = {
  imageList: Image[];
};

const ImageList: React.FC<Props> = ({ imageList }: Props) => (
  <section>
    <div className="container">
      <ImageRow imageList={imageList.slice(0, 3)} />
      <ImageRow imageList={imageList.slice(3, 6)} />
      <ImageRow imageList={imageList.slice(6, 9)} />
    </div>
  </section>
);
export default ImageList;
