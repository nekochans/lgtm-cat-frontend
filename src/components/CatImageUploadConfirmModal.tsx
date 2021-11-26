import React from 'react';
import Modal from 'react-modal';
import UploadCatImagePreview from './UploadCatImagePreview';

type Props = {
  isOpen: boolean;
  onClickCancel: () => void;
  onClickUpload: () => Promise<void>;
  imagePreviewUrl: string;
};

const CatImageUploadConfirmModal: React.FC<Props> = ({
  isOpen,
  onClickCancel,
  onClickUpload,
  imagePreviewUrl,
}) => (
  <Modal isOpen={isOpen} ariaHideApp={false}>
    <div className="modal is-active">
      <div className="modal-background" />
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
          <strong>この画像をアップロードします。よろしいですか？</strong>
          <UploadCatImagePreview imagePreviewUrl={imagePreviewUrl} />
        </section>
        <footer className="modal-card-foot">
          <button
            type="button"
            className="button is-success"
            onClick={onClickUpload}
          >
            アップロードする
          </button>
          <button type="button" className="button" onClick={onClickCancel}>
            キャンセル
          </button>
        </footer>
      </div>
    </div>
  </Modal>
);

export default CatImageUploadConfirmModal;
