import React, { useState, ChangeEvent } from 'react';
import UploadCatImagePreview from './UploadCatImagePreview';
import CatImageUploadDescription from './CatImageUploadDescription';
import CatImageUploadError from './CatImageUploadError';
import CatImageUploadSuccessMessage from './CatImageUploadSuccessMessage';

const acceptedTypes: string[] = ['image/png', 'image/jpg', 'image/jpeg'];

const CatImageUploadForm: React.FC = () => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [uploaded, setUploaded] = useState<boolean>();

  const isValidFileType = (fileType: string): boolean =>
    acceptedTypes.includes(fileType);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploaded(false);
      if (!isValidFileType(file.type)) {
        setErrorMessage(
          `${file.type} の画像は許可されていません。png, jpg, jpeg の画像のみアップロード出来ます。`,
        );
        setImagePreviewUrl('');

        return;
      }

      const url = URL.createObjectURL(file);

      setErrorMessage('');
      setImagePreviewUrl(url);
      // TODO 以下の課題で https://github.com/nekochans/lgtm-cat-api/pull/8 で作成中のAPIにリクエストする処理を追加
      // https://github.com/nekochans/lgtm-cat-frontend/issues/76
    }
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO 以下の課題で window.confirm の利用はやめてちゃんとしたモーダルを使った処理に変更する
    // https://github.com/nekochans/lgtm-cat-frontend/issues/93
    if (window.confirm('この画像をアップロードします。よろしいですか？')) {
      setUploaded(true);
      setErrorMessage('');
      setImagePreviewUrl('');

      return true;
    }

    return false;
  };

  return (
    <div className="container">
      <CatImageUploadDescription />
      <form method="post" onSubmit={handleOnSubmit}>
        <div className="file has-name is-boxed">
          <label className="file-label mb-3" htmlFor="cat-image-upload">
            <input
              className="file-input"
              type="file"
              name="uploadedCatImage"
              id="cat-image-upload"
              onChange={handleFileUpload}
            />
            <span className="file-cta">
              <span className="file-icon">
                <i className="fas fa-upload" />
              </span>
              <span className="file-label">猫ちゃん画像を選択</span>
            </span>
          </label>
        </div>
        <button
          className="button is-primary mb-6"
          type="submit"
          disabled={!(imagePreviewUrl && errorMessage === '')}
        >
          アップロードする
        </button>
      </form>
      {imagePreviewUrl ? (
        <UploadCatImagePreview imagePreviewUrl={imagePreviewUrl} />
      ) : (
        ''
      )}
      {errorMessage ? <CatImageUploadError message={errorMessage} /> : ''}
      {uploaded ? <CatImageUploadSuccessMessage /> : ''}
    </div>
  );
};

export default CatImageUploadForm;
