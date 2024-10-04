import { IconButton } from '@/app/_components/IconButton';
import type { Language } from '@/features/language';
import { createIncludeLanguageAppPath } from '@/features/url';
import type { JSX } from 'react';

type Props = {
  language: Language;
};

export const LoginButton = ({ language }: Props): JSX.Element => {
  return (
    <IconButton
      displayText={language === 'en' ? 'Login' : 'ログイン'}
      showGithubIcon={true}
      link={createIncludeLanguageAppPath('login', language)}
    />
  );
};
