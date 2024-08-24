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

const linkStyle =
  'text-[#43281E] font-inter text-sm font-normal leading-5 hover:underline';

export const Footer = ({ language }: Props): JSX.Element => {
  const terms = createTermsOfUseLinksFromLanguages(language);

  const privacy = createPrivacyPolicyLinksFromLanguages(language);

  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);

  return (
    <footer className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-[375px] items-center px-0 py-3 md:hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <Link href={terms.link} prefetch={false} className={linkStyle}>
            <Text data-gtm-click="footer-terms-link">{terms.text}</Text>
          </Link>
          <Link href={privacy.link} prefetch={false} className={linkStyle}>
            <Text data-gtm-click="footer-privacy-link">{privacy.text}</Text>
          </Link>
          <Link
            href={externalTransmissionPolicy.link}
            prefetch={false}
            className={linkStyle}
          >
            <Text data-gtm-click="footer-external-transmission-policy-link">
              {externalTransmissionPolicy.text}
            </Text>
          </Link>
        </div>
      </div>
      <div className="flex h-[60px] items-center justify-center self-stretch border-t border-orange-200 bg-orange-50">
        <Text className="font-inter text-base font-medium text-orange-800">
          Copyright (c) nekochans
        </Text>
      </div>
    </footer>
  );
};
