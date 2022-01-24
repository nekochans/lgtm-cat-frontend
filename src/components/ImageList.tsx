import React from 'react';

import { LgtmImages } from '../domain/types/lgtmImage';

import ImageRow from './ImageRow';

type Props = LgtmImages;

const ImageList: React.FC<Props> = ({ lgtmImages }: Props) => (
  <section>
    <div className="container">
      {/* eslint-disable-next-line no-magic-numbers */}
      <ImageRow lgtmImages={lgtmImages.slice(0, 3)} />
      {/* eslint-disable-next-line no-magic-numbers */}
      <ImageRow lgtmImages={lgtmImages.slice(3, 6)} />
      {/* eslint-disable-next-line no-magic-numbers */}
      <ImageRow lgtmImages={lgtmImages.slice(6, 9)} />
    </div>
  </section>
);
export default ImageList;
