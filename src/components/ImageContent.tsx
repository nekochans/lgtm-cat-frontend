import Image from 'next/image';
import React, { useCallback, useState } from 'react';

import { LgtmImage } from '../domain/types/lgtmImage';
import useClipboardMarkdown from '../hooks/useClipboardMarkdown';
import { sendCopyMarkdownEvent } from '../infrastructures/utils/gtag';

type Props = {
  image: LgtmImage;
};

const ImageContent: React.FC<Props> = ({ image }: Props) => {
  const [copied, setCopied] = useState(false);
  const [opacity, setOpacity] = useState('1');

  const onCopySuccess = useCallback(() => {
    sendCopyMarkdownEvent('copy_markdown_button');

    const messageDisplayTime = 1000;

    setOpacity('1');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, messageDisplayTime);
  }, []);

  const { imageContextRef } = useClipboardMarkdown(onCopySuccess, image.url);

  return (
    <div className="column is-one-third" key={image.id} ref={imageContextRef}>
      <div
        style={{
          height: '300px',
          position: 'relative',
          cursor: 'pointer',
          opacity,
        }}
        onMouseEnter={() => setOpacity('0.7')}
        onMouseLeave={() => setOpacity('1')}
      >
        <Image
          src={image.url}
          layout="fill"
          objectFit="contain"
          alt="lgtm-cat-image"
          priority={true}
        />
        {copied && (
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
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
