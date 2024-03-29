import { uploadCatImage } from '@/api';
import {
  createSuccessResult,
  isFailureResult,
  UploadCatImageSizeTooLargeError,
  UploadCatImageValidationError,
  type AcceptedTypesImageExtension,
  type ImageUploader,
  type Language,
  type Url,
} from '@/features';
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
  (language: Language, appBaseUrl: Url) =>
  async (image: string, imageExtension: AcceptedTypesImageExtension) => {
    const uploadCatImageResult = await uploadCatImage({
      image,
      imageExtension,
      appBaseUrl,
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

export const useCatImageUploader = (
  language: Language,
  appBaseUrl: Url,
): { imageUploader: ImageUploader } => ({
  imageUploader: createCatImageUploader(language, appBaseUrl),
});
