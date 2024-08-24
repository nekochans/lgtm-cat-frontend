import { createExternalTransmissionPolicyLinksFromLanguages } from '@/features/externalTransmissionPolicy';
import type { Language } from '@/features/language';
import { createPrivacyPolicyLinksFromLanguages } from '@/features/privacyPolicy';
import { createTermsOfUseLinksFromLanguages } from '@/features/termsOfUse';
import Link from 'next/link';
import type { JSX } from 'react';
import { Text } from 'react-aria-components';

export type Props = {
  language: Language;
};

export const Footer = ({ language }: Props): JSX.Element => {
  const terms = createTermsOfUseLinksFromLanguages(language);

  const privacy = createPrivacyPolicyLinksFromLanguages(language);

  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);

  return (
    <footer>
      <Link href={terms.link} prefetch={false}>
        <Text data-gtm-click="footer-terms-link">{terms.text}</Text>
      </Link>
      <Link href={privacy.link} prefetch={false}>
        <Text data-gtm-click="footer-privacy-link">{privacy.text}</Text>
      </Link>
      <Link href={externalTransmissionPolicy.link} prefetch={false}>
        <Text data-gtm-click="footer-external-transmission-policy-link">
          {externalTransmissionPolicy.text}
        </Text>
      </Link>
      <Text>Copyright (c) nekochans</Text>
    </footer>
  );
};
