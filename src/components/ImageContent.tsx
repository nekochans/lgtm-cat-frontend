import React, { useState } from 'react';
import { Image } from '../domain/image';

type Props = {
  image: Image;
};

const ImageContent: React.FC<Props> = ({ image }: Props) => {
  const [copied, setCopied] = useState(false);
  const onClicked = () => {
    setCopied(true);
  };

  return (
    // eslint-disable-next-line
    <div
      className="column is-one-third"
      key={image.id}
      onClick={() => onClicked()}
    >
      <div
        style={{
          margin: 'auto',
          height: '100%',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <img
          src={image.url}
          style={{ maxHeight: '300px', padding: '0.75rem' }}
          alt="lgtm cat"
        />
        {copied && (
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '50%',
              color: 'white',
              transform: 'translate(-50%, 0)',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '30px',
              padding: '3%',
            }}
          >
            Github Markdown Copied!
          </div>
        )}
      </div>
    </div>
  );
};
export default ImageContent;
