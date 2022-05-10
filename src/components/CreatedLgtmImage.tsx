import { useCallback, useState } from 'react';

import useClipboardMarkdown from '../hooks/useClipboardMarkdown';
import { sendCopyMarkdownEvent } from '../infrastructures/utils/gtm';

// TODO 以下の制御コメントは https://github.com/nekochans/lgtm-cat-frontend/issues/166#issuecomment-1120215152 で TypeScript 4.5 にアップグレードしたタイミングで修正する
// eslint-disable-next-line no-duplicate-imports
import type { VFC } from 'react';

type Props = {
  imagePreviewUrl: string;
  createdLgtmImageUrl: string;
};

const CreatedLgtmImage: VFC<Props> = ({
  imagePreviewUrl,
  createdLgtmImageUrl,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const [opacity, setOpacity] = useState('1');

  const onCopySuccess = useCallback(() => {
    sendCopyMarkdownEvent('created_lgtm_image');

    const messageDisplayTime = 1000;

    setOpacity('1');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, messageDisplayTime);
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
