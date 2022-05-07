import { useCallback, useState } from 'react';

import useClipboardMarkdown from '../hooks/useClipboardMarkdown';
import { sendCopyMarkdownEvent } from '../infrastructures/utils/gtm';

// TODO 以下の制御コメントは https://github.com/nekochans/lgtm-cat-frontend/issues/166#issuecomment-1120215152 で TypeScript 4.5 にアップグレードしたタイミングで修正する
// eslint-disable-next-line no-duplicate-imports
import type { VFC } from 'react';

type Props = {
  createdLgtmImageUrl: string;
};

const CopyMarkdownSourceButton: VFC<Props> = ({ createdLgtmImageUrl }) => {
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
