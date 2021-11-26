import React from 'react';
import UploadCatImagePreview from './UploadCatImagePreview';

type Props = {
  imagePreviewUrl: string;
};

const CatImageUploadConfirmModal: React.FC<Props> = ({ imagePreviewUrl }) => (
  <div className="modal is-active">
    <div className="modal-background" />
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">猫ちゃん画像アップロード確認</p>
        <button type="button" className="delete" aria-label="close" />
      </header>
      <section className="modal-card-body">
        <strong>この画像をアップロードします。よろしいですか？</strong>
        <UploadCatImagePreview imagePreviewUrl={imagePreviewUrl} />
      </section>
      <footer className="modal-card-foot">
        <button type="button" className="button is-success">
          アップロードする
        </button>
        <button type="button" className="button">
          キャンセル
        </button>
      </footer>
    </div>
  </div>
);

export default CatImageUploadConfirmModal;
