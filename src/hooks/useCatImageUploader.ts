import { issueAccessToken, uploadCatImage } from '../api';
import {
  UploadCatImageSizeTooLargeError,
  UploadCatImageValidationError,
  createSuccessResult,
  isFailureResult,
  type Language,
  AcceptedTypesImageExtension,
} from '../features';

import {
  createCatImageSizeTooLargeErrorMessages,
  createUnexpectedErrorMessages,
} from './createErrorMessages';

const createDisplayErrorMessages = (
  error: Error,
  language: Language,
): string[] => {
  if (
    error instanceof UploadCatImageSizeTooLargeError ||
    error.name === 'UploadCatImageSizeTooLargeError'
  ) {
    return createCatImageSizeTooLargeErrorMessages(language);
  }

  if (
    error instanceof UploadCatImageValidationError ||
    error.name === 'UploadCatImageValidationError'
  ) {
    return language === 'en'
      ? ['Invalid image format.', 'Sorry, please use another image.']
      : [
          '画像フォーマットが不正です。',
          'お手数ですが別の画像を利用して下さい。',
        ];
  }

  return createUnexpectedErrorMessages(language);
};

const createCatImageUploader =
  (language: Language) =>
  async (image: string, imageExtension: AcceptedTypesImageExtension) => {
    const accessToken = await issueAccessToken();

    const uploadCatImageResult = await uploadCatImage({
      accessToken,
      image,
      imageExtension,
    });
    if (isFailureResult(uploadCatImageResult)) {
      return createSuccessResult({
        displayErrorMessages: createDisplayErrorMessages(
          uploadCatImageResult.value,
          language,
        ),
      });
    }

    return createSuccessResult({
      displayErrorMessages: [],
      createdLgtmImageUrl: uploadCatImageResult.value.createdLgtmImageUrl,
    });
  };

export const useCatImageUploader = (language: Language) => ({
  imageUploader: createCatImageUploader(language),
});
