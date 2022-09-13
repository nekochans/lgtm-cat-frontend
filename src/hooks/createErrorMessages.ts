import { Language } from '../features';

export const createCatImageSizeTooLargeErrorMessages = (language: Language) =>
  language === 'en'
    ? ['Image size is too large.', 'Please use images under 4MB.']
    : [
        '画像サイズが大きすぎます。',
        'お手数ですが4MB以下の画像を利用して下さい。',
      ];

export const createUnexpectedErrorMessages = (language: Language) =>
  language === 'en'
    ? [
        'An unexpected Error occurred.',
        'Sorry, please try again after some time has passed.',
      ]
    : [
        '予期せぬエラーが発生しました。',
        'お手数ですが、しばらく時間が経ってからお試し下さい。',
      ];
