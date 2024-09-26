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
        <div className="flex w-full items-center justify-between pl-7">
          <div className="flex items-center gap-24">
            <HeaderLogo language={language} />
            <nav className="flex items-center gap-6">
              <Link
                href={appPathList.upload}
                className="flex items-center justify-center bg-orange-500 p-5 text-base font-medium text-orange-50 hover:text-orange-100"
              >
                <Text slot="label">アップロード</Text>
              </Link>
              <Link
                href="/how-to-use"
                className="flex items-center justify-center bg-orange-500 p-5 text-base font-medium text-orange-50 hover:text-orange-100"
              >
                <Text slot="label">使い方</Text>
              </Link>
              <Link
                href={terms.link}
                className="flex items-center justify-center bg-orange-500 p-5 text-base font-medium text-orange-50 hover:text-orange-100"
              >
                <Text slot="label">{terms.text}</Text>
              </Link>
              <MenuTrigger>
                <Button className="flex items-center justify-center gap-2 bg-orange-500 px-5 py-2 text-base font-medium text-orange-50 hover:text-orange-100">
                  ポリシー
                  <DownIcon />
                </Button>
                <Popover className="bg-orange-500 shadow-lg ring-1 ring-black ring-opacity-5">
                  <Menu className="w-[180px]">
                    <MenuItem className="flex w-full items-center px-6 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                      <Link href={privacy.link} className="w-full">
                        <Text slot="label">{privacy.text}</Text>
                      </Link>
                    </MenuItem>
                    <MenuItem className="flex w-full items-center px-6 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                      <Link
                        href={externalTransmissionPolicy.link}
                        className="w-full"
                      >
                        <Text slot="label">
                          {externalTransmissionPolicy.text}
                        </Text>
                      </Link>
                    </MenuItem>
                  </Menu>
                </Popover>
              </MenuTrigger>
            </nav>
          </div>
          <div className="flex items-center gap-4 px-7">
            <MenuTrigger>
              <Button className="flex items-center justify-center gap-2 bg-orange-500 px-5 py-2 text-base font-medium text-orange-50 hover:text-orange-100">
                <span className="flex size-5 items-center justify-center">
                  <GlobeIcon />
                </span>
                language
                <span className="flex size-4 items-center justify-center">
                  <DownIcon />
                </span>
              </Button>
              <Popover className="bg-orange-500 shadow-lg ring-1 ring-black ring-opacity-5">
                <Menu className="w-[167px]">
                  <MenuItem
                    className={`flex w-full items-center px-5 py-2 text-left text-base font-medium ${
                      language === 'ja'
                        ? 'bg-orange-400 text-orange-50'
                        : 'bg-orange-500 text-orange-50 hover:bg-orange-600'
                    }`}
                  >
                    <Link
                      href={currentUrlPath}
                      className="flex w-full items-center"
                    >
                      <span className="flex items-center gap-2">
                        {language === 'ja' && <RightIcon />}
                        <Text slot="label">日本語</Text>
                      </span>
                    </Link>
                  </MenuItem>
                  <MenuItem
                    className={`flex w-full items-center px-5 py-2 text-left text-base font-medium ${
                      language === 'en'
                        ? 'bg-orange-400 text-orange-50'
                        : 'bg-orange-500 text-orange-50 hover:bg-orange-600'
                    }`}
                  >
                    <Link
                      href={currentUrlPath}
                      className="flex w-full items-center"
                    >
                      <span className="flex items-center gap-2">
                        {language === 'en' && <RightIcon />}
                        <Text slot="label">English</Text>
                      </span>
                    </Link>
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
            <LoginButton language={language} />
          </div>
        </div>
      </div>
    </ReactAriaHeader>
  );
};
