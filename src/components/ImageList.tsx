import { LgtmImages } from '../domain/types/lgtmImage';

import ImageRow from './ImageRow';

import type { VFC } from 'react';

type Props = LgtmImages;

const ImageList: VFC<Props> = ({ lgtmImages }) => (
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
