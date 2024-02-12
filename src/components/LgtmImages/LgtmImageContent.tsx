import { defaultAppUrl, type AppUrl } from '@/constants';
import type { LgtmImage } from '@/features';
import { useClipboardMarkdown, useCopySuccess } from '@/hooks';
import Image from 'next/image';
import type { FC } from 'react';
import { CopiedGithubMarkdownMessage } from './CopiedGithubMarkdownMessage';
import styles from './LgtmImageContent.module.css';

type Props = LgtmImage & {
  appUrl?: AppUrl;
  callback?: () => void;
};

export const LgtmImageContent: FC<Props> = ({
  id,
  imageUrl,
  appUrl,
  callback,
}) => {
  const { copied, onCopySuccess } = useCopySuccess(callback);

  const { imageContextRef } = useClipboardMarkdown({
    onCopySuccess,
    imageUrl,
    appUrl: appUrl ?? defaultAppUrl,
  });

  return (
    <div key={id} ref={imageContextRef} className={styles.wrapper}>
      <Image
        src={imageUrl}
        style={{ objectFit: 'contain' }}
        sizes="100vw"
        fill
        alt="lgtm-cat-image"
        priority={true}
      />
      {copied ? <CopiedGithubMarkdownMessage /> : ''}
    </div>
  );
};
