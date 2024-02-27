import { createIncludeLanguageAppPath, type Language } from '@/features';
import { assertNever } from '@/utils';
import type { LinkAttribute } from './linkAttribute';

export const createPrivacyPolicyLinksFromLanguages = (
  language: Language,
): LinkAttribute => {
  switch (language) {
    case 'en':
      return {
        text: 'Privacy Policy',
        link: createIncludeLanguageAppPath('privacy', language),
      };
    case 'ja':
      return {
        text: 'プライバシーポリシー',
        link: createIncludeLanguageAppPath('privacy', language),
      };
    default:
      return assertNever(language);
  }
};
