import React, { useState, ChangeEvent } from 'react';
import UploadCatImagePreview from './UploadCatImagePreview';
import CatImageUploadDescription from './CatImageUploadDescription';
import CatImageUploadError from './CatImageUploadError';
import CatImageUploadSuccessMessage from './CatImageUploadSuccessMessage';
import CreatedLgtmImage from './CreatedLgtmImage';
import {
  AcceptedTypesImageExtension,
  UploadCatImage,
} from '../domain/repositories/imageRepository';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import ProgressBar from './ProgressBar';
import { sendUploadCatImage } from '../infrastructures/utils/gtag';
import CopyMarkdownSourceButton from './CopyMarkdownSourceButton';
import AfterUploadWarningMessage from './AfterUploadWarningMessage';
import CatImageUploadConfirmModal from './CatImageUploadConfirmModal';

// TODO acceptedTypesは定数化して分離する
const acceptedTypes: string[] = ['image/png', 'image/jpg', 'image/jpeg'];

type Props = {
  uploadCatImage: UploadCatImage;
};

const CatImageUploadForm: React.FC<Props> = ({ uploadCatImage }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();
  const [base64Image, setBase64Image] = useState<string>('');
  const [uploadImageExtension, setUploadImageExtension] = useState<
    AcceptedTypesImageExtension | string
  >('');
  const [createdLgtmImageUrl, setCreatedLgtmImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [uploaded, setUploaded] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  // TODO どの画像を許可するかはビジネスロジックとして意味があるので分離する
  const isValidFileType = (fileType: string): boolean =>
    acceptedTypes.includes(fileType);

  const extractImageExtFromValidFileType = (
    fileType: string,
  ): AcceptedTypesImageExtension =>
    `.${fileType.replace('image/', '')}` as AcceptedTypesImageExtension;

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
        setIsLoading(false);

        return;
      }

      const url = URL.createObjectURL(file);

      setErrorMessage('');
      setImagePreviewUrl(url);
      setUploadImageExtension(extractImageExtFromValidFileType(fileType));
      setIsLoading(false);

      const reader = new FileReader();
      reader.onload = handleReaderLoaded;
      reader.readAsBinaryString(file);
    }
  };

  const createDisplayErrorMessage = (error: Error) => {
    const errorName = error.name;

    // TODO errorNameを型安全に取り出せるようにリファクタリングする
    switch (errorName) {
      case 'UploadCatImageSizeTooLargeError':
        return '画像サイズが大きすぎます。お手数ですが2MB以下の画像を利用して下さい。';
      case 'UploadCatImageValidationError':
        return '画像フォーマットが不正です。お手数ですが別の画像を利用して下さい。';
      default:
        return 'アップロード中に予期せぬエラーが発生しました。お手数ですが、しばらく時間が経ってからお試し下さい。';
    }
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    openModal();
  };

  const onClickUpload = async () => {
    closeModal();

    setIsLoading(true);

    const uploadCatResult = await uploadCatImage({
      image: base64Image,
      imageExtension: uploadImageExtension as AcceptedTypesImageExtension,
    });

    if (isSuccessResult(uploadCatResult)) {
      setUploaded(true);
      setErrorMessage('');
      setCreatedLgtmImageUrl(uploadCatResult.value.imageUrl);
      setIsLoading(false);
    } else {
      setErrorMessage(createDisplayErrorMessage(uploadCatResult.value));
      setImagePreviewUrl('');
      setUploadImageExtension('');
      setCreatedLgtmImageUrl('');
      setIsLoading(false);
    }

    sendUploadCatImage('upload_cat_image_button');
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
    <>
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
          {uploaded ? (
            <CopyMarkdownSourceButton
              createdLgtmImageUrl={createdLgtmImageProps.createdLgtmImageUrl}
            />
          ) : (
            ''
          )}
        </form>
        {isLoading ? <ProgressBar /> : ''}
        {imagePreviewUrl && !uploaded ? (
          <UploadCatImagePreview imagePreviewUrl={imagePreviewUrl} />
        ) : (
          ''
        )}
        {errorMessage ? <CatImageUploadError message={errorMessage} /> : ''}
        {uploaded ? <CatImageUploadSuccessMessage /> : ''}
        {uploaded ? <AfterUploadWarningMessage /> : ''}
        {uploaded ? (
          <CreatedLgtmImage
            imagePreviewUrl={createdLgtmImageProps.imagePreviewUrl}
            createdLgtmImageUrl={createdLgtmImageProps.createdLgtmImageUrl}
          />
        ) : (
          ''
        )}
      </div>
      <CatImageUploadConfirmModal
        isOpen={modalIsOpen}
        onClickCancel={closeModal}
        onClickUpload={onClickUpload}
        imagePreviewUrl={imagePreviewUrl as string}
      />
    </>
  );
};

export default CatImageUploadForm;
