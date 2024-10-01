import { type Language } from '@/features/language';
import { assertNever } from '@/utils/assertNever';

export const uploadText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return 'アップロード';
    case 'en':
      return 'Upload new Cats';
    default:
      return assertNever(language);
  }
};

export const howToUseText = (language: Language): string => {
  switch (language) {
    case 'ja':
      return '使い方';
    case 'en':
      return 'How to Use';
    default:
      return assertNever(language);
  }
};
