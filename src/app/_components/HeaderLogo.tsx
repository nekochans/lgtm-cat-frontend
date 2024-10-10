import type { Language } from '@/features/language';
import type { JSX } from 'react';
import { LgtmCatIcon } from '@/app/_components/LgtmCatIcon';
import { createIncludeLanguageAppPath } from '@/features/url';
import Link from 'next/link';
import { Text } from 'react-aria-components';

export type Props = {
  language: Language;
};

export function HeaderLogo({ language }: Props): JSX.Element {
  const homeToLink = createIncludeLanguageAppPath('home', language);

  return (
    <Link
      href={homeToLink}
      className="flex h-10 w-[218px] items-center justify-center gap-0.5 bg-orange-500"
      prefetch={false}
    >
      {/* eslint-disable-next-line react/prefer-shorthand-boolean */}
      <LgtmCatIcon className="shrink-0" aria-hidden={true} />
      <h1 className="text-4xl font-bold text-orange-50 no-underline">
        <Text>LGTMeow</Text>
      </h1>
    </Link>
  );
}
