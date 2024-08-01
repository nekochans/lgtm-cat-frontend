import { createIncludeLanguageAppPath, type Language } from '@/features';
import { assertNever } from '@/utils';
import type { LinkAttribute } from './linkAttribute';

export const createExternalTransmissionPolicyLinksFromLanguages = (
  language: Language,
): LinkAttribute => {
  switch (language) {
    case 'en':
      return {
        text: 'External Transmission Policy',
        link: createIncludeLanguageAppPath(
          'external-transmission-policy',
          language,
        ),
      };
    case 'ja':
      return {
        text: '外部送信ポリシー',
        link: createIncludeLanguageAppPath(
          'external-transmission-policy',
          language,
        ),
      };
    default:
      return assertNever(language);
  }
};
