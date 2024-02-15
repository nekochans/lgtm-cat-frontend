import { defaultAppUrl, type AppUrl } from '@/constants';
import type { Language, LgtmImageUrl } from '@/features';
import { useClipboardMarkdown, useCopySuccess } from '@/hooks';
import { assertNever } from '@/utils';
import type { FC } from 'react';
import { CopiedGithubMarkdownMessage } from '../../LgtmImages/CopiedGithubMarkdownMessage';
import styles from './SuccessMessageArea.module.css';

const titleText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'アップロードが成功しました🐱！';
    case 'en':
      return 'Upload succeeded🐱!';
    default:
      return assertNever(language);
  }
};

const closeButtonText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return '閉じる';
    case 'en':
      return 'close';
    default:
      return assertNever(language);
  }
};

const markdownSourceCopyButtonText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'Markdownソースをコピー';
    case 'en':
      return 'Copy Markdown source';
    default:
      return assertNever(language);
  }
};

const mainMessageText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return `LGTM画像を作成しているので少々お待ち下さい。「${markdownSourceCopyButtonText(
        language,
      )}」ボタンか上の画像をクリックするとMarkdownソースがコピーされます。`;
    case 'en':
      return `Please wait a moment while we create the LGTM image. Click on the "${markdownSourceCopyButtonText(
        language,
      )}" button or the image above to copy the Markdown source.`;
    default:
      return assertNever(language);
  }
};

const descriptionText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return '※トップページの「New arrival Cats」ボタンを押下するとアップロードした画像を確認できます。';
    case 'en':
      return '※Click the "New arrival Cats" button on the top page to see the uploaded images.';
    default:
      return assertNever(language);
  }
};

type Props = {
  language: Language;
  createdLgtmImageUrl: LgtmImageUrl;
  onClickClose?: () => void;
  appUrl?: AppUrl;
  callback?: () => void;
};

export const SuccessMessageArea: FC<Props> = ({
  language,
  createdLgtmImageUrl,
  onClickClose,
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
    <div className={styles.wrapper}>
      <div className={styles.title}>{titleText(language)}</div>
      <div className={styles['contents-wrapper']}>
        <div className={styles['main-message']}>
          {mainMessageText(language)}
        </div>
        <div className={styles['under-section-wrapper']}>
          <div className={styles['description-wrapper']}>
            <div className={styles['description-text']}>
              {descriptionText(language)}
            </div>
          </div>
          <div className={styles['button-group']}>
            <button className={styles['close-button']} onClick={onClickClose}>
              <div className={styles['close-button-text']}>
                {closeButtonText(language)}
              </div>
            </button>
            <button
              className={styles['markdown-source-copy-button']}
              ref={imageContextRef}
            >
              <div className={styles['markdown-source-copy-button-text']}>
                {markdownSourceCopyButtonText(language)}
              </div>
            </button>
          </div>
        </div>
        {copied ? <CopiedGithubMarkdownMessage /> : ''}
      </div>
    </div>
  );
};
