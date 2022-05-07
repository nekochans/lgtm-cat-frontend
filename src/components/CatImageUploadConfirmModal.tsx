import Modal from 'react-modal';

import AfterUploadInfoMessage from './AfterUploadInfoMessage';
import CatImageUploadSuccessMessage from './CatImageUploadSuccessMessage';
import CopyMarkdownSourceButton from './CopyMarkdownSourceButton';
import CreatedLgtmImage from './CreatedLgtmImage';
import ProgressBar from './ProgressBar';
import UploadCatImagePreview from './UploadCatImagePreview';

import type { VFC, MouseEvent } from 'react';

type Props = {
  isOpen: boolean;
  onClickCancel: () => void;
  onClickUpload: () => Promise<void>;
  isLoading: boolean;
  shouldDisableButton: () => boolean;
  uploaded?: boolean;
  // TODO react/require-default-props のルールは無効化したほうが良いかも、Default値を持たせるにしても関数型Componentの場合は引数のDefault値で表現するべき
  // eslint-disable-next-line react/require-default-props
  imagePreviewUrl?: string;
  createdLgtmImageUrl?: string;
};

// eslint-disable-next-line max-lines-per-function
const CatImageUploadConfirmModal: VFC<Props> = ({
  isOpen,
  onClickCancel,
  onClickUpload,
  isLoading,
  shouldDisableButton,
  uploaded,
  imagePreviewUrl,
  createdLgtmImageUrl,
}) => {
  const onClickOutSideModal = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClickCancel();
    }
  };

  return (
    <Modal isOpen={isOpen} ariaHideApp={false} onRequestClose={onClickCancel}>
      <div className="modal is-active">
        <div
          className="modal-background"
          onClick={onClickOutSideModal}
          role="presentation"
        />
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">猫ちゃん画像アップロード確認</p>
            <button
              type="button"
              className="delete"
              aria-label="close"
              onClick={onClickCancel}
            />
          </header>
          <section className="modal-card-body">
            {uploaded ? (
              ''
            ) : (
              <strong>この画像をアップロードします。よろしいですか？</strong>
            )}
            {isLoading ? <ProgressBar /> : ''}
            {uploaded ? <CatImageUploadSuccessMessage /> : ''}
            {uploaded ? <AfterUploadInfoMessage /> : ''}
            {imagePreviewUrl && !uploaded ? (
              <UploadCatImagePreview imagePreviewUrl={imagePreviewUrl} />
            ) : (
              ''
            )}
            {uploaded ? (
              <CreatedLgtmImage
                imagePreviewUrl={imagePreviewUrl ?? ''}
                createdLgtmImageUrl={createdLgtmImageUrl ?? ''}
              />
            ) : (
              ''
            )}
          </section>
          <footer className="modal-card-foot">
            <button
              type="button"
              className="button is-success"
              onClick={onClickUpload}
              disabled={shouldDisableButton()}
            >
              アップロードする
            </button>
            <button type="button" className="button" onClick={onClickCancel}>
              キャンセル
            </button>
            {uploaded ? (
              <CopyMarkdownSourceButton
                createdLgtmImageUrl={createdLgtmImageUrl ?? ''}
              />
            ) : (
              ''
            )}
          </footer>
        </div>
      </div>
    </Modal>
  );
};

export default CatImageUploadConfirmModal;
