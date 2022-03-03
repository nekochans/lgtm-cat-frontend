import React, { useCallback, useState } from 'react';

import useClipboardMarkdown from '../hooks/useClipboardMarkdown';
import { sendCopyMarkdownEvent } from '../infrastructures/utils/gtag';

type Props = {
  createdLgtmImageUrl: string;
};

const CopyMarkdownSourceButton: React.FC<Props> = ({ createdLgtmImageUrl }) => {
  const [copied, setCopied] = useState(false);

  const onCopySuccess = useCallback(() => {
    sendCopyMarkdownEvent('after_upload_copy_markdown_button');

    const messageDisplayTime = 1000;

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
    <>
      <button
        className="button is-primary m-4"
        type="button"
        ref={imageContextRef}
      >
        Markdownソースをコピー
      </button>
      {copied && (
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            top: '200px',
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
    </>
  );
};

export default CopyMarkdownSourceButton;
