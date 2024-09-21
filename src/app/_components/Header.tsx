import { HeaderLogo } from '@/app/_components/HeaderLogo';
import type { Language } from '@/features/language';
import type { JSX } from 'react';

type Props = {
  language: Language;
};

export const Header = ({ language }: Props): JSX.Element => {
  return (
    <header className="flex w-[1440px] items-center border-b border-orange-300 bg-orange-500 px-5 py-0">
      <HeaderLogo language={language} />
    </header>
  );
};
