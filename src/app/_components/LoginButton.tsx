import type { Language } from '@/features/language';
import type { JSX } from 'react';
import { IconButton } from '@/app/_components/IconButton';
import { createIncludeLanguageAppPath } from '@/features/url';

type Props = {
  language: Language;
};

export function LoginButton({ language }: Props): JSX.Element {
  return (
    <IconButton
      displayText={language === 'en' ? 'Login' : 'ログイン'}
      // eslint-disable-next-line react/prefer-shorthand-boolean
      showGithubIcon={true}
      link={createIncludeLanguageAppPath('login', language)}
    />
  );
}
