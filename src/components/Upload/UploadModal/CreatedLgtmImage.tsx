import { defaultAppUrl, type AppUrl } from '@/constants';
import { type LgtmImageUrl } from '@/features';
import { useClipboardMarkdown, useCopySuccess } from '@/hooks';
import type { FC } from 'react';
import { CopiedGithubMarkdownMessage } from '../../LgtmImages/CopiedGithubMarkdownMessage';
import styles from './CreatedLgtmImage.module.css';

type Props = {
  imagePreviewUrl: string;
  createdLgtmImageUrl: LgtmImageUrl;
  appUrl?: AppUrl;
  callback?: () => void;
};

export const CreatedLgtmImage: FC<Props> = ({
  imagePreviewUrl,
  createdLgtmImageUrl,
  appUrl,
  callback,
}) => {
  const { copied, onCopySuccess } = useCopySuccess(callback);

  const { imageContextRef } = useClipboardMarkdown({
    onCopySuccess,
    imageUrl: createdLgtmImageUrl,
    appUrl: appUrl ?? defaultAppUrl,
  });

  return (
    <>
      <div ref={imageContextRef} className={styles.wrapper}>
        <img
          src={imagePreviewUrl}
          className={styles.image}
          alt="Uploaded cat"
        />
      </div>
      {copied ? <CopiedGithubMarkdownMessage /> : ''}
    </>
  );
};
