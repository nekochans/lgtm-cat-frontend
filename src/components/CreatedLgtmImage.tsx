import React, { useCallback, useState } from 'react';
import { sendCopyMarkdownEvent } from '../infrastructures/utils/gtag';
import useClipboardMarkdown from '../hooks/useClipboardMarkdown';

type Props = {
  imagePreviewUrl: string;
  createdLgtmImageUrl: string;
};

const CreatedLgtmImage: React.FC<Props> = ({
  imagePreviewUrl,
  createdLgtmImageUrl,
}: Props) => {
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

  const { imageContextRef } = useClipboardMarkdown(
    onCopySuccess,
    createdLgtmImageUrl,
  );

  return (
    <div className="column" key={imagePreviewUrl} ref={imageContextRef}>
      <div
        style={{
          opacity,
        }}
        onMouseEnter={() => setOpacity('0.7')}
        onMouseLeave={() => setOpacity('1')}
      >
        <img src={imagePreviewUrl} alt="createdLgtmImage" />
        {copied && (
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
              bottom: '25%',
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

export default CreatedLgtmImage;