import { LgtmCatIcon } from '@/app/_components/LgtmCatIcon';
import type { Language } from '@/features/language';
import { createIncludeLanguageAppPath } from '@/features/url';
import Link from 'next/link';
import type { JSX } from 'react';
import { Text } from 'react-aria-components';

export type Props = {
  language: Language;
};

export const HeaderLogo = ({ language }: Props): JSX.Element => {
  const homeToLink = createIncludeLanguageAppPath('home', language);

  return (
    <Link
      href={homeToLink}
      className="flex h-10 w-[218px] items-center justify-center gap-0.5 border-b border-orange-300 bg-orange-500"
      prefetch={false}
    >
      <LgtmCatIcon className="shrink-0" aria-hidden={true} />
      <h1 className="text-4xl font-bold text-orange-50">
        <Text>LGTMeow</Text>
      </h1>
    </Link>
  );
};
