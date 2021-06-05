import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { Image as ImageType } from '../domain/types/image';
import useClipboardMarkdown from '../hooks/useClipboardMarkdown';
import { sendCopyMarkdownEvent } from '../utils/gtag';

type Props = {
  image: ImageType;
};

const ImageContent: React.FC<Props> = ({ image }: Props) => {
  const [copied, setCopied] = useState(false);
  const [opacity, setOpacity] = useState('1');

  const onCopySuccess = useCallback(() => {
    sendCopyMarkdownEvent('copy_markdown_button');

    setOpacity('1');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
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
        <Image src={image.url} layout="fill" objectFit="contain" />
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
