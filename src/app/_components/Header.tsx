import { HeaderLogo } from '@/app/_components/HeaderLogo';
import { createExternalTransmissionPolicyLinksFromLanguages } from '@/features/externalTransmissionPolicy';
import type { Language } from '@/features/language';
import { createPrivacyPolicyLinksFromLanguages } from '@/features/privacyPolicy';
import { createTermsOfUseLinksFromLanguages } from '@/features/termsOfUse';
import { appPathList, type IncludeLanguageAppPath } from '@/features/url';
import Link from 'next/link';
import type { JSX } from 'react';
import { Header as ReactAriaHeader, Text } from 'react-aria-components';

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
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-0 sm:px-6 lg:px-8">
        <HeaderLogo language={language} />
        <nav className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-24">
          <Link
            href={appPathList.upload}
            className="text-base font-medium text-orange-50 hover:text-orange-100 sm:text-lg"
          >
            <Text>アップロード</Text>
          </Link>
          <Link
            href="/how-to-use"
            className="text-base font-medium text-orange-50 hover:text-orange-100 sm:text-lg"
          >
            <Text>使い方</Text>
          </Link>
          <Link
            href={terms.link}
            className="text-base font-medium text-orange-50 hover:text-orange-100 sm:text-lg"
          >
            <Text>{terms.text}</Text>
          </Link>
          <div className="group relative">
            <button className="flex items-center text-base font-medium text-orange-50 hover:text-orange-100 sm:text-lg">
              ポリシー
              <svg
                className="ml-1 size-4 sm:size-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 hidden w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <Link
                  href={privacy.link}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Text>{privacy.text}</Text>
                </Link>
                <Link
                  href={externalTransmissionPolicy.link}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Text>{externalTransmissionPolicy.text}</Text>
                </Link>
              </div>
            </div>
          </div>
          <div className="group relative">
            <button className="flex items-center text-base font-medium text-orange-50 hover:text-orange-100 sm:text-lg">
              language
              <svg
                className="ml-1 size-4 sm:size-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 hidden w-48 rounded-md bg-orange-500 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="language-menu"
              >
                <Link
                  href={currentUrlPath}
                  className="block w-full px-4 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600"
                  role="menuitem"
                >
                  日本語
                </Link>
                <Link
                  href={currentUrlPath}
                  className="block w-full px-4 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600"
                  role="menuitem"
                >
                  English
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </ReactAriaHeader>
  );
};
