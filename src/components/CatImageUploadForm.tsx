/* eslint-disable max-lines-per-function, max-statements */
// TODO https://github.com/nekochans/lgtm-cat-frontend/issues/107 を実施する際にファイル先頭のESLintの制御コメントを削除する
import { useState } from 'react';

import UploadCatImageSizeTooLargeError from '../domain/errors/UploadCatImageSizeTooLargeError';
import UploadCatImageValidationError from '../domain/errors/UploadCatImageValidationError';
import {
  AcceptedTypesImageExtension,
  IsAcceptableCatImageNotAcceptableReason,
  UploadCatImage,
} from '../domain/repositories/imageRepository';
import { isSuccessResult } from '../domain/repositories/repositoryResult';
import { issueAccessToken } from '../infrastructures/repositories/api/fetch/authTokenRepository';
import { isAcceptableCatImage } from '../infrastructures/repositories/api/fetch/imageRepository';
import assertNever from '../infrastructures/utils/assertNever';
import { sendUploadCatImage } from '../infrastructures/utils/gtm';

import CatImageUploadConfirmModal from './CatImageUploadConfirmModal';
import CatImageUploadDescription from './CatImageUploadDescription';
import CatImageUploadError from './CatImageUploadError';

// TODO 以下の制御コメントは https://github.com/nekochans/lgtm-cat-frontend/issues/166#issuecomment-1120215152 で TypeScript 4.5 にアップグレードしたタイミングで修正する
// eslint-disable-next-line no-duplicate-imports
import type { VFC, ChangeEvent, FormEvent } from 'react';

// TODO acceptedTypesは定数化して分離する
const acceptedTypes: string[] = ['image/png', 'image/jpg', 'image/jpeg'];

type Props = {
  uploadCatImage: UploadCatImage;
};

const CatImageUploadForm: VFC<Props> = ({ uploadCatImage }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();
  const [base64Image, setBase64Image] = useState<string>('');
  const [uploadImageExtension, setUploadImageExtension] = useState<
    AcceptedTypesImageExtension | string
  >('');
  const [createdLgtmImageUrl, setCreatedLgtmImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [uploaded, setUploaded] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

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

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    // eslint-disable-next-line no-magic-numbers
    if (event.target.files && event.target.files.length > 0) {
      const targetIndex = 0;
      const file = event.target.files[targetIndex];
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

      openModal();
    }
  };

  const createDisplayErrorMessage = (error: Error) => {
    if (error instanceof UploadCatImageSizeTooLargeError) {
      return '画像サイズが大きすぎます。お手数ですが4MB以下の画像を利用して下さい。';
    }

    if (error instanceof UploadCatImageValidationError) {
      return '画像フォーマットが不正です。お手数ですが別の画像を利用して下さい。';
    }

    return 'アップロード中に予期せぬエラーが発生しました。お手数ですが、しばらく時間が経ってからお試し下さい。';
  };

  const createDisplayErrorMessageFromNotAcceptableReason = (
    notAcceptableReason: IsAcceptableCatImageNotAcceptableReason,
  ): string => {
    switch (notAcceptableReason) {
      case 'not an allowed image extension':
        return 'png, jpg, jpeg の画像のみアップロード出来ます。';
      case 'not moderation image':
        return 'この画像は不適切なものが写っているので利用出来ません。';
      case 'person face in the image':
        return '申し訳ありませんが人の顔が写っていない画像をご利用ください。';
      case 'not cat image':
        return '申し訳ありませんがはっきりと猫が写っている画像をご利用ください。';
      case 'an error has occurred':
        return '予期せぬエラーが発生しました。お手数ですが、しばらく時間が経ってからお試し下さい。';
      default:
        return assertNever(notAcceptableReason);
    }
  };

  const handleOnSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    openModal();
  };

  const onClickUpload = async () => {
    setIsLoading(true);

    const accessTokenResult = await issueAccessToken();
    if (!isSuccessResult(accessTokenResult)) {
      setErrorMessage(createDisplayErrorMessage(accessTokenResult.value));
      setImagePreviewUrl('');
      setUploadImageExtension('');
      setCreatedLgtmImageUrl('');
      setIsLoading(false);
      closeModal();

      return;
    }

    const isAcceptableCatImageResult = await isAcceptableCatImage({
      accessToken: accessTokenResult.value,
      image: base64Image,
      imageExtension: uploadImageExtension as AcceptedTypesImageExtension,
    });

    if (isSuccessResult(isAcceptableCatImageResult)) {
      if (!isAcceptableCatImageResult.value.isAcceptableCatImage) {
        setErrorMessage(
          createDisplayErrorMessageFromNotAcceptableReason(
            isAcceptableCatImageResult.value.notAcceptableReason,
          ),
        );
        setImagePreviewUrl('');
        setUploadImageExtension('');
        setCreatedLgtmImageUrl('');
        setIsLoading(false);
        closeModal();

        return;
      }
    } else {
      setErrorMessage(
        createDisplayErrorMessage(isAcceptableCatImageResult.value),
      );
      setImagePreviewUrl('');
      setUploadImageExtension('');
      setCreatedLgtmImageUrl('');
      setIsLoading(false);
      closeModal();

      return;
    }

    const uploadCatResult = await uploadCatImage({
      accessToken: accessTokenResult.value,
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
      closeModal();
    }

    sendUploadCatImage('upload_cat_image_button');
  };

  const shouldDisableButton = (): boolean => {
    if (errorMessage !== '') {
      return true;
    }

    return uploaded === true && imagePreviewUrl !== '';
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
        </form>
        {errorMessage ? <CatImageUploadError message={errorMessage} /> : ''}
      </div>
      <CatImageUploadConfirmModal
        isOpen={modalIsOpen}
        onClickCancel={closeModal}
        onClickUpload={onClickUpload}
        isLoading={isLoading}
        shouldDisableButton={shouldDisableButton}
        uploaded={uploaded}
        imagePreviewUrl={imagePreviewUrl}
        createdLgtmImageUrl={createdLgtmImageUrl}
      />
    </>
  );
};

export default CatImageUploadForm;
