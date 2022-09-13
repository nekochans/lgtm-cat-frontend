import { issueAccessToken, isAcceptableCatImage } from '../api';
import {
  createSuccessResult,
  isFailureResult,
  type Language,
  AcceptedTypesImageExtension,
  IsAcceptableCatImageNotAcceptableReason,
} from '../features';
import { assertNever } from '../utils';

import {
  createCatImageSizeTooLargeErrorMessages,
  createUnexpectedErrorMessages,
} from './createErrorMessages';

const createNotAcceptableReasons = (
  notAcceptableReason: IsAcceptableCatImageNotAcceptableReason,
  language: Language,
): string[] => {
  switch (notAcceptableReason) {
    case 'not an allowed image extension':
      return language === 'en'
        ? ['Sorry, only png, jpg, jpeg images can be uploaded.']
        : ['png, jpg, jpeg の画像のみアップロード出来ます。'];
    case 'not moderation image':
      return language === 'en'
        ? [
            'Sorry, This image is not available because it shows something inappropriate.',
          ]
        : ['この画像は不適切なものが写っているので利用出来ません。'];
    case 'person face in the image':
      return language === 'en'
        ? ["Sorry, please use images that do not show people's faces."]
        : ['申し訳ありませんが人の顔が写っていない画像をご利用ください。'];
    case 'not cat image':
      return language === 'en'
        ? ['Sorry, but please use images that clearly show the cat.']
        : ['申し訳ありませんがはっきりと猫が写っている画像をご利用ください。'];
    case 'an error has occurred':
      return createUnexpectedErrorMessages(language);
    default:
      return assertNever(notAcceptableReason);
  }
};

const createImageValidator =
  (language: Language) =>
  async (image: string, imageExtension: AcceptedTypesImageExtension) => {
    const accessToken = await issueAccessToken();

    const isAcceptableCatImageResult = await isAcceptableCatImage({
      accessToken,
      image,
      imageExtension,
    });

    if (isFailureResult(isAcceptableCatImageResult)) {
      return createSuccessResult({
        isAcceptableCatImage: false,
        notAcceptableReason: createCatImageSizeTooLargeErrorMessages(language),
      });
    }

    if (isAcceptableCatImageResult.value.isAcceptableCatImage) {
      return createSuccessResult({
        isAcceptableCatImage:
          isAcceptableCatImageResult.value.isAcceptableCatImage,
        notAcceptableReason: [],
      });
    }

    return createSuccessResult({
      isAcceptableCatImage:
        isAcceptableCatImageResult.value.isAcceptableCatImage,
      notAcceptableReason: createNotAcceptableReasons(
        isAcceptableCatImageResult.value.notAcceptableReason,
        language,
      ),
    });
  };

export const useCatImageValidator = (language: Language) => ({
  imageValidator: createImageValidator(language),
});
