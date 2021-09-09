import React, { useCallback, useState } from 'react';
import { sendCopyMarkdownEvent } from '../infrastructures/utils/gtag';
import useClipboardMarkdown from '../hooks/useClipboardMarkdown';

type Props = {
  createdLgtmImageUrl: string;
};

const CopyMarkdownSourceButton: React.FC<Props> = ({ createdLgtmImageUrl }) => {
  const [copied, setCopied] = useState(false);

  const onCopySuccess = useCallback(() => {
    sendCopyMarkdownEvent('after_upload_copy_markdown_button');

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
            top: '50%',
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
