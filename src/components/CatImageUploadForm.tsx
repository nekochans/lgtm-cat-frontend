import React, { useState, ChangeEvent } from 'react';
import UploadCatImagePreview from './UploadCatImagePreview';
import CatImageUploadDescription from './CatImageUploadDescription';
import CatImageUploadError from './CatImageUploadError';
import CatImageUploadSuccessMessage from './CatImageUploadSuccessMessage';
import CreatedLgtmImage from './CreatedLgtmImage';
import { UploadedImageResponse } from '../pages/api/lgtm/images';

const acceptedTypes: string[] = ['image/png', 'image/jpg', 'image/jpeg'];

const CatImageUploadForm: React.FC = () => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();
  const [base64Image, setBase64Image] = useState<string>('');
  const [uploadImageExtension, setUploadImageExtension] = useState<string>('');
  const [createdLgtmImageUrl, setCreatedLgtmImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [uploaded, setUploaded] = useState<boolean>();

  const isValidFileType = (fileType: string): boolean =>
    acceptedTypes.includes(fileType);

  const handleReaderLoaded = (event: ProgressEvent<FileReader>) => {
    if (event.target === null) {
      return;
    }

    const binaryString = event.target?.result;
    if (typeof binaryString !== 'string') {
      return;
    }

    setBase64Image(btoa(binaryString));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploaded(false);
      const fileType = file.type;
      if (!isValidFileType(fileType)) {
        setErrorMessage(
          `${fileType} の画像は許可されていません。png, jpg, jpeg の画像のみアップロード出来ます。`,
        );
        setImagePreviewUrl('');
        setUploadImageExtension('');
        setCreatedLgtmImageUrl('');

        return;
      }

      const url = URL.createObjectURL(file);

      setErrorMessage('');
      setImagePreviewUrl(url);
      // TODO 拡張子を抜き出す関数は別の関数に分離する
      setUploadImageExtension(`.${fileType.replace('image/', '')}`);

      const reader = new FileReader();
      reader.onload = handleReaderLoaded;
      reader.readAsBinaryString(file);
    }
  };

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO 以下の課題で window.confirm の利用はやめてちゃんとしたモーダルを使った処理に変更する
    // https://github.com/nekochans/lgtm-cat-frontend/issues/93
    if (window.confirm('この画像をアップロードします。よろしいですか？')) {
      // TODO アップロードAPIのエラーが発生した際の処理を追加
      // TODO アップロード中はローディング用のComponentを表示させる
      // TODO APIにリクエストするリポジトリ用の関数を外から渡すようにする
      const response = await fetch('/api/lgtm/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          imageExtension: uploadImageExtension,
        }),
      });

      const responseBody = (await response.json()) as UploadedImageResponse;

      setUploaded(true);
      setErrorMessage('');

      if (responseBody.uploadedImage?.imageUrl) {
        setCreatedLgtmImageUrl(responseBody.uploadedImage?.imageUrl);
      }

      return true;
    }

    return false;
  };

  const shouldDisableButton = (): boolean => {
    if (errorMessage !== '') {
      return true;
    }

    return uploaded === true && imagePreviewUrl !== '';
  };

  // TODO 以下の課題で固定値ではなく、APIからの結果を渡すようにする
  // https://github.com/nekochans/lgtm-cat-frontend/issues/76
  const createdLgtmImageProps = {
    imagePreviewUrl: imagePreviewUrl ?? '',
    createdLgtmImageUrl: createdLgtmImageUrl ?? '',
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
          className="button is-primary m-4"
          type="submit"
          disabled={shouldDisableButton()}
        >
          アップロードする
        </button>
      </form>
      {imagePreviewUrl && !uploaded ? (
        <UploadCatImagePreview imagePreviewUrl={imagePreviewUrl} />
      ) : (
        ''
      )}
      {errorMessage ? <CatImageUploadError message={errorMessage} /> : ''}
      {uploaded ? <CatImageUploadSuccessMessage /> : ''}
      {uploaded ? (
        <CreatedLgtmImage
          imagePreviewUrl={createdLgtmImageProps.imagePreviewUrl}
          createdLgtmImageUrl={createdLgtmImageProps.createdLgtmImageUrl}
        />
      ) : (
        ''
      )}
    </div>
  );
};

export default CatImageUploadForm;
