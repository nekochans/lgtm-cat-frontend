import { defaultAppUrl, type AppUrl } from '@/constants';
import { type LgtmImageUrl } from '@/features';
import { useClipboardMarkdown, useCopySuccess } from '@/hooks';
import type { ComponentProps, FC } from 'react';
import { FaRandom } from 'react-icons/fa';
import { CopiedGithubMarkdownMessage } from '../../LgtmImages/CopiedGithubMarkdownMessage';
import styles from './CatRandomCopyButton.module.css';

export type Props = ComponentProps<'button'> & {
  imageUrl: LgtmImageUrl;
  callback?: () => void;
  appUrl?: AppUrl;
};

export const CatRandomCopyButton: FC<Props> = ({
  imageUrl,
  callback,
  appUrl,
}) => {
  const { copied, onCopySuccess } = useCopySuccess(callback);
  const { imageContextRef } = useClipboardMarkdown({
    onCopySuccess,
    imageUrl,
    appUrl: appUrl ?? defaultAppUrl,
  });

  return (
    <>
      <button ref={imageContextRef} className={`button-base ${styles.button}`}>
        <FaRandom className={styles['fa-random']} />
        <div className="button-text">Cats Random Copied</div>
      </button>
      {copied ? <CopiedGithubMarkdownMessage position="upper" /> : ''}
    </>
  );
};
