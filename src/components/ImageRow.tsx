import React from 'react';
import { Image } from '../domain/image';

type Props = {
  imageList: Image[];
};

const ImageRow: React.FC<Props> = ({ imageList }: Props) => (
  <div className="columns">
    {imageList.map((image) => (
      <div className="column is-one-third" key={image.id}>
        <div
          style={{
            margin: 'auto',
            height: '100%',
            textAlign: 'center',
          }}
        >
          <img
            src={image.url}
            style={{ maxHeight: '300px', padding: '0.75rem' }}
            alt="lgtm cat"
          />
        </div>
      </div>
    ))}
  </div>
);
export default ImageRow;
