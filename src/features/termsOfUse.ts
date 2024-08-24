import { type Language } from '@/features/language';
import { createIncludeLanguageAppPath } from '@/features/url';
import { assertNever } from '@/utils/assertNever';
import type { LinkAttribute } from './linkAttribute';

export const createTermsOfUseLinksFromLanguages = (
  language: Language,
): LinkAttribute => {
  switch (language) {
    case 'en':
      return {
        text: 'Terms of Use',
        link: createIncludeLanguageAppPath('terms', language),
      };
    case 'ja':
      return {
        text: '利用規約',
        link: createIncludeLanguageAppPath('terms', language),
      };
    default:
      return assertNever(language);
  }
};
