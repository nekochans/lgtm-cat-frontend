import type { Language } from '@/features';
import { assertNever } from '@/utils';
import type { LinkAttribute } from './linkAttribute';

export const createTermsOfUseLinksFromLanguages = (
  language: Language,
): LinkAttribute => {
  const link = '/terms';

  switch (language) {
    case 'en':
      return {
        text: 'Terms of Use',
        link,
      };
    case 'ja':
      return {
        text: '利用規約',
        link,
      };
    default:
      return assertNever(language);
  }
};
