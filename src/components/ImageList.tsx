import React from 'react';
import { LgtmImage } from '../utils/sampleLtgmData';
import ImageRow from './ImageRow';

type Props = {
  imageList: LgtmImage[];
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
