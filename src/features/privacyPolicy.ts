import type { Language } from '@/features';
import { assertNever } from '@/utils';
import type { LinkAttribute } from './linkAttribute';

export const createPrivacyPolicyLinksFromLanguages = (
  language: Language,
): LinkAttribute => {
  const link = '/privacy';

  switch (language) {
    case 'en':
      return {
        text: 'Privacy Policy',
        link,
      };
    case 'ja':
      return {
        text: 'プライバシーポリシー',
        link,
      };
    default:
      return assertNever(language);
  }
};
