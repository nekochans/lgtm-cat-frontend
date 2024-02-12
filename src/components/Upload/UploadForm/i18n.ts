import { acceptableImageSizeThresholdText, type Language } from '@/features';
import { assertNever } from '@/utils';

export const imageDropAreaText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'ここに画像をドロップ';
    case 'en':
      return 'Drop image here';
    default:
      return assertNever(language);
  }
};

export const uploadInputButtonText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'またはファイルの選択';
    case 'en':
      return 'Select an image file';
    default:
      return assertNever(language);
  }
};

export const cautionText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return '注意事項';
    case 'en':
      return 'precautions';
    default:
      return assertNever(language);
  }
};

export const noteList = (language: Language): string[] => {
  switch (language) {
    case 'ja':
      return [
        '拡張子が png, jpg, jpeg の画像のみアップロード出来ます。',
        '猫が写っていない画像はアップロード出来ません。',
        '人の顔がはっきり写っている画像はアップロード出来ません。',
        '猫のイラスト等は正確に判定出来ない事があります。',
      ];
    case 'en':
      return [
        'png, jpg, jpeg, images are available.',
        'Images without cats cannot be uploaded.',
        "Images that clearly show a person's face cannot be uploaded.",
        'Illustrations of cats may not be accurately determined.',
      ];
    default:
      return assertNever(language);
  }
};

export const createNotAllowedImageExtensionErrorMessage = (
  fileType: string,
  language: Language,
): string[] => {
  switch (language) {
    case 'ja':
      return [
        `${fileType} の画像は許可されていません。`,
        'png, jpg, jpeg の画像のみアップロード出来ます。',
      ];
    case 'en':
      return [
        `${fileType} is not allowed.`,
        'Only png, jpg, jpeg images can be uploaded.',
      ];
    default:
      return assertNever(language);
  }
};

export const createImageSizeTooLargeErrorMessage = (
  language: Language,
): string[] => {
  switch (language) {
    case 'ja':
      return [
        '画像サイズが大きすぎます。',
        `お手数ですが${acceptableImageSizeThresholdText}以下の画像を利用して下さい。`,
      ];
    case 'en':
      return [
        `Image size is too large.`,
        `Please use images under ${acceptableImageSizeThresholdText}.`,
      ];
    default:
      return assertNever(language);
  }
};

export const unexpectedErrorMessage = (language: Language): string[] => {
  switch (language) {
    case 'ja':
      return [
        '予期せぬエラーが発生しました。',
        'お手数ですが、しばらく時間が経ってからお試し下さい。',
      ];
    case 'en':
      return [
        'An unexpected error occurred during upload.',
        'Sorry, please try again after some time has passed.',
      ];
    default:
      return assertNever(language);
  }
};
