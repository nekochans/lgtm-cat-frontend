import { HeaderLogo } from '@/app/_components/HeaderLogo';
import { DownIcon } from '@/app/_components/icons/DownIcon';
import { GlobeIcon } from '@/app/_components/icons/GlobeIcon';
import { RightIcon } from '@/app/_components/icons/RightIcon';
import { LoginButton } from '@/app/_components/LoginButton';
import { createExternalTransmissionPolicyLinksFromLanguages } from '@/features/externalTransmissionPolicy';
import type { Language } from '@/features/language';
import { createPrivacyPolicyLinksFromLanguages } from '@/features/privacyPolicy';
import { createTermsOfUseLinksFromLanguages } from '@/features/termsOfUse';
import { appPathList, type IncludeLanguageAppPath } from '@/features/url';
import Link from 'next/link';
import type { JSX } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Header as ReactAriaHeader,
  Text,
} from 'react-aria-components';

type Props = {
  language: Language;
  currentUrlPath: IncludeLanguageAppPath;
};

export const Header = ({ language, currentUrlPath }: Props): JSX.Element => {
  const terms = createTermsOfUseLinksFromLanguages(language);
  const privacy = createPrivacyPolicyLinksFromLanguages(language);
  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);

  return (
    <ReactAriaHeader className="w-full border-b border-orange-300 bg-orange-500">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-5">
        <HeaderLogo language={language} />
        <nav className="flex items-center gap-6">
          <Link
            href={appPathList.upload}
            className="text-base font-medium text-orange-50 hover:text-orange-100"
          >
            <Text slot="label">アップロード</Text>
          </Link>
          <Link
            href="/how-to-use"
            className="text-base font-medium text-orange-50 hover:text-orange-100"
          >
            <Text slot="label">使い方</Text>
          </Link>
          <Link
            href={terms.link}
            className="text-base font-medium text-orange-50 hover:text-orange-100"
          >
            <Text slot="label">{terms.text}</Text>
          </Link>
          <MenuTrigger>
            <Button className="flex items-center text-base font-medium text-orange-50 hover:text-orange-100">
              ポリシー
              <DownIcon />
            </Button>
            <Popover className="w-48 rounded-md bg-orange-500 shadow-lg ring-1 ring-black ring-opacity-5">
              <Menu className="py-1">
                <MenuItem className="block w-full px-4 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                  <Link href={privacy.link}>
                    <Text slot="label">{privacy.text}</Text>
                  </Link>
                </MenuItem>
                <MenuItem className="block w-full px-4 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                  <Link href={externalTransmissionPolicy.link}>
                    <Text slot="label">{externalTransmissionPolicy.text}</Text>
                  </Link>
                </MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
          <MenuTrigger>
            <Button className="flex items-center text-base font-medium text-orange-50 hover:text-orange-100">
              <GlobeIcon />
              language
              <DownIcon />
            </Button>
            <Popover className="w-48 rounded-md bg-orange-500 shadow-lg ring-1 ring-black ring-opacity-5">
              <Menu className="py-1">
                <MenuItem
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-base font-medium ${
                    language === 'ja'
                      ? 'bg-orange-600 text-orange-50'
                      : 'text-orange-50 hover:bg-orange-600'
                  }`}
                >
                  <Link href={currentUrlPath}>
                    <Text slot="label">日本語</Text>
                  </Link>
                  {language === 'ja' && <RightIcon />}
                </MenuItem>
                <MenuItem
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-base font-medium ${
                    language === 'en'
                      ? 'bg-orange-600 text-orange-50'
                      : 'text-orange-50 hover:bg-orange-600'
                  }`}
                >
                  <Link href={currentUrlPath}>
                    <Text slot="label">English</Text>
                  </Link>
                  {language === 'en' && <RightIcon />}
                </MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
          <LoginButton language={language} />
        </nav>
      </div>
    </ReactAriaHeader>
  );
};
