import type { AppUrl } from '@/constants';
import type { Language, LgtmImageUrl } from '@/features';
import { assertNever } from '@/utils';
import type { FC } from 'react';
import Modal from 'react-modal';
import { UploadProgressBar } from '../UploadProgressBar';
import { ButtonGroup } from './ButtonGroup';
import { CreatedLgtmImage } from './CreatedLgtmImage';
import { SuccessMessageArea } from './SuccessMessageArea';
import styles from './UploadModal.module.css';

export type Props = {
  isOpen: boolean;
  language: Language;
  imagePreviewUrl: string;
  onClickUpload: () => Promise<void>;
  onClickCancel: () => void;
  onClickClose: () => void;
  isLoading: boolean;
  createdLgtmImageUrl: LgtmImageUrl;
  uploaded?: boolean;
  onClickCreatedLgtmImage?: () => void;
  onClickMarkdownSourceCopyButton?: () => void;
  appUrl?: AppUrl;
};

const titleText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return '猫ちゃん画像アップロード確認';
    case 'en':
      return 'Cat image upload confirmed';
    default:
      return assertNever(language);
  }
};

const confirmMessageText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'この画像をアップロードします。よろしいですか？';
    case 'en':
      return 'Upload this image. Are you sure?';
    default:
      return assertNever(language);
  }
};

const mediaQuery = '@media (maxWidth: 767px)';

const modalStyle = {
  // stylelint-disable-next-line
  overlay: {
    background: 'rgba(54, 46, 43, 0.7)',
  },
  content: {
    // stylelint-disable-next-line selector-type-case, selector-type-no-unknown
    [mediaQuery]: {
      width: '370px',
    },
    inset: '0',
    width: '540px',
    height: '540px',
    margin: 'auto',
  },
};

// eslint-disable-next-line max-lines-per-function
export const UploadModal: FC<Props> = ({
  isOpen,
  language,
  imagePreviewUrl,
  onClickUpload,
  onClickCancel,
  onClickClose,
  isLoading,
  uploaded = false,
  createdLgtmImageUrl,
  onClickCreatedLgtmImage,
  onClickMarkdownSourceCopyButton,
  appUrl,
}) => {
  if (uploaded) {
    modalStyle.content.height = '705px';
  } else {
    modalStyle.content.height = '540px';
  }

  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      style={modalStyle}
      onRequestClose={onClickCancel}
    >
      <div className={styles.wrapper}>
        <div className={styles['contents-wrapper']}>
          <div className={styles.title}>{titleText(language)}</div>
          <div className={styles['form-wrapper']}>
            {uploaded ? (
              <CreatedLgtmImage
                imagePreviewUrl={imagePreviewUrl}
                createdLgtmImageUrl={createdLgtmImageUrl}
                callback={onClickCreatedLgtmImage}
                appUrl={appUrl}
              />
            ) : (
              <div className={styles['preview-image-wrapper']}>
                <img
                  className={styles['preview-image']}
                  src={imagePreviewUrl}
                  alt="cat preview"
                />
              </div>
            )}
            {!isLoading && !uploaded ? (
              <>
                <div className={styles['confirm-message']}>
                  {confirmMessageText(language)}
                </div>
              </>
            ) : (
              ''
            )}
          </div>
          {uploaded && createdLgtmImageUrl && !isLoading ? (
            <SuccessMessageArea
              language={language}
              createdLgtmImageUrl={createdLgtmImageUrl}
              onClickClose={onClickClose}
              callback={onClickMarkdownSourceCopyButton}
              appUrl={appUrl}
            />
          ) : (
            ''
          )}
          {!uploaded && !createdLgtmImageUrl && !isLoading ? (
            <ButtonGroup
              language={language}
              onClickUpload={onClickUpload}
              onClickCancel={onClickCancel}
            />
          ) : (
            ''
          )}
          {isLoading ? <UploadProgressBar language={language} /> : ''}
        </div>
      </div>
    </Modal>
  );
};
