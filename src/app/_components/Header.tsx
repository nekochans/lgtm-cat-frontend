import { HeaderLogo } from '@/app/_components/HeaderLogo';
import { DownIcon } from '@/app/_components/icons/DownIcon';
import { GlobeIcon } from '@/app/_components/icons/GlobeIcon';
import { RightIcon } from '@/app/_components/icons/RightIcon';
import { LoginButton } from '@/app/_components/LoginButton';
import { createExternalTransmissionPolicyLinksFromLanguages } from '@/features/externalTransmissionPolicy';
import { removeLanguageFromAppPath, type Language } from '@/features/language';
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
import { howToUseText, policyText, uploadText } from './HeaderI18n';

type Props = {
  language: Language;
  currentUrlPath: IncludeLanguageAppPath;
  isLoggedIn: boolean;
};

const GithubIcon = (): JSX.Element => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9.35371 19.3393C9.35371 19.4353 9.24403 19.5127 9.10387 19.5127C8.94613 19.5272 8.83645 19.4498 8.83645 19.3393C8.83645 19.2433 8.94613 19.1659 9.08629 19.1659C9.22645 19.1514 9.35371 19.2288 9.35371 19.3393ZM7.58065 19.1224C7.54839 19.2184 7.64048 19.3318 7.78065 19.3608C7.90161 19.4092 8.04177 19.3608 8.06935 19.2648C8.09694 19.1688 8.00887 19.0554 7.86871 19.0119C7.74774 18.9781 7.61290 19.0264 7.58065 19.1224ZM10.0645 19.0554C9.92435 19.0892 9.82661 19.1881 9.84419 19.2986C9.86177 19.3946 9.98871 19.4574 10.1363 19.4236C10.2766 19.3898 10.3742 19.2909 10.3567 19.1949C10.3391 19.1034 10.2048 19.0406 10.0645 19.0554ZM13.8387 0.305127C6.00403 0.305127 0 6.25799 0 13.9061C0 20.0977 3.95032 25.3365 9.56855 27.1212C10.2911 27.251 10.5452 26.8413 10.5452 26.5034C10.5452 26.1885 10.5282 24.2585 10.5282 23.0857C10.5282 23.0857 6.57661 23.9095 5.74677 21.3923C5.74677 21.3923 5.10323 19.7514 4.17742 19.3273C4.17742 19.3273 2.88468 18.4411 4.26548 18.4556C4.26548 18.4556 5.67339 18.5661 6.44677 19.914C7.68387 22.0922 9.75484 21.4618 10.5621 21.1194C10.6919 20.2332 11.0589 19.6028 11.4653 19.2329C8.30968 18.8863 5.12581 18.4411 5.12581 13.1306C5.12581 11.6045 5.55484 10.8261 6.45484 9.83308C6.29129 9.49521 5.81452 7.95506 6.58789 6.01012C7.78468 5.67225 10.5 7.52541 10.5 7.52541C11.629 7.23045 12.8468 7.07796 14.0548 7.07796C15.2629 7.07796 16.4806 7.23045 17.6097 7.52541C17.6097 7.52541 20.325 5.66772 21.5218 6.01012C22.2952 7.95959 21.8185 9.49521 21.6548 9.83308C22.5548 10.8306 23.1048 11.609 23.1048 13.1306C23.1048 18.4556 19.7831 18.8818 16.6274 19.2329C17.1452 19.6662 17.5879 20.4945 17.5879 21.8098C17.5879 23.7108 17.5708 26.0711 17.5708 26.4944C17.5708 26.8323 17.8315 27.242 18.5484 27.1122C24.1831 25.3365 28 20.0977 28 13.9061C28 6.25799 21.6734 0.305127 13.8387 0.305127ZM5.48709 17.1864C5.41371 17.2347 5.43129 17.3481 5.52661 17.4396C5.61694 17.5131 5.74274 17.5469 5.81613 17.4816C5.88952 17.4333 5.87194 17.3199 5.77661 17.2284C5.68629 17.1549 5.56048 17.1211 5.48709 17.1864ZM4.87742 16.7042C4.83871 16.767 4.89516 16.8439 4.99048 16.8923C5.06387 16.9406 5.16161 16.9261 5.20032 16.8588C5.23903 16.796 5.18258 16.7191 5.08726 16.6708C4.99048 16.6418 4.91613 16.6563 4.87742 16.7042ZM6.70645 18.5371C6.61613 18.5999 6.65161 18.7472 6.78065 18.8387C6.90968 18.9496 7.06774 18.9641 7.14113 18.8868C7.21452 18.824 7.17903 18.6767 7.06774 18.5852C6.94355 18.4743 6.77984 18.4598 6.70645 18.5371ZM6.06290 17.8099C5.97258 17.8582 5.97258 17.9861 6.06290 18.097C6.15323 18.2079 6.30081 18.2562 6.37419 18.2079C6.46452 18.1451 6.46452 18.0172 6.37419 17.9063C6.29516 17.7954 6.15323 17.7471 6.06290 17.8099Z"
        fill="#FFF7ED"
      />
    </svg>
  );
};

export const Header = ({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element => {
  const terms = createTermsOfUseLinksFromLanguages(language);
  const privacy = createPrivacyPolicyLinksFromLanguages(language);
  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);
  const removedLanguagePath = removeLanguageFromAppPath(currentUrlPath);

  return (
    <ReactAriaHeader className="w-full border-b border-orange-300 bg-orange-500">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-5">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-24">
            <HeaderLogo language={language} />
            <nav className="flex items-center gap-6">
              <Link
                href={appPathList.upload}
                className="flex items-center justify-center bg-orange-500 p-5 text-base font-medium text-orange-50 hover:text-orange-100"
              >
                <Text slot="label" className="text-base font-bold">
                  {uploadText(language)}
                </Text>
              </Link>
              <Link
                href="/how-to-use"
                className="flex items-center justify-center bg-orange-500 p-5 text-base font-medium text-orange-50 hover:text-orange-100"
              >
                <Text slot="label" className="text-base font-bold">
                  {howToUseText(language)}
                </Text>
              </Link>
              <Link
                href={terms.link}
                className="flex items-center justify-center bg-orange-500 p-5 text-base font-medium text-orange-50 hover:text-orange-100"
              >
                <Text slot="label" className="text-base font-bold">
                  {terms.text}
                </Text>
              </Link>
              <MenuTrigger>
                <Button className="flex items-center justify-center gap-2 bg-orange-500 px-5 py-2 text-base font-medium text-orange-50 hover:text-orange-100">
                  <Text className="text-base font-bold">
                    {policyText(language)}
                  </Text>
                  <DownIcon />
                </Button>
                <Popover className="bg-orange-500 shadow-lg ring-1 ring-black/5">
                  <Menu className="min-w-[200px] max-w-[400px]">
                    <MenuItem className="flex w-full items-center px-6 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                      <Link href={privacy.link} className="w-full">
                        <Text slot="label" className="text-base font-bold">
                          {privacy.text}
                        </Text>
                      </Link>
                    </MenuItem>
                    <MenuItem className="flex w-full items-center px-6 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                      <Link
                        href={externalTransmissionPolicy.link}
                        className="w-full"
                      >
                        <Text slot="label" className="text-base font-bold">
                          {externalTransmissionPolicy.text}
                        </Text>
                      </Link>
                    </MenuItem>
                  </Menu>
                </Popover>
              </MenuTrigger>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <MenuTrigger>
              <Button className="flex items-center justify-center gap-2 bg-orange-500 px-5 py-2 text-base font-medium text-orange-50 hover:text-orange-100">
                <span className="flex items-center justify-center">
                  <GlobeIcon />
                </span>
                <Text className="text-base font-bold">language</Text>
                <span className="flex items-center justify-center">
                  <DownIcon />
                </span>
              </Button>
              <Popover className="mt-1 bg-orange-500 shadow-lg ring-1 ring-black/5">
                <Menu className="min-w-[180px]">
                  <MenuItem
                    className={`flex w-full items-center px-5 py-2 text-left text-base font-medium ${
                      language === 'ja'
                        ? 'bg-orange-400 text-orange-50'
                        : 'bg-orange-500 text-orange-50 hover:bg-orange-600'
                    }`}
                  >
                    <Link
                      href={removedLanguagePath}
                      className="flex w-full items-center"
                    >
                      <span className="flex items-center gap-2">
                        {language === 'ja' && <RightIcon />}
                        <Text slot="label" className="text-base font-bold">
                          日本語
                        </Text>
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
                      href={`/en${removedLanguagePath}`}
                      className="flex w-full items-center"
                    >
                      <span className="flex items-center gap-2">
                        {language === 'en' && <RightIcon />}
                        <Text slot="label" className="text-base font-bold">
                          English
                        </Text>
                      </span>
                    </Link>
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
            {isLoggedIn ? (
              <MenuTrigger>
                <Button className="flex items-center justify-center gap-2 bg-orange-500 px-5 py-2 text-base font-medium text-orange-50 hover:text-orange-100">
                  <span className="flex items-center gap-2">
                    <GithubIcon />
                    <DownIcon />
                  </span>
                </Button>
                <Popover className="mt-1 bg-orange-500 shadow-lg ring-1 ring-black/5">
                  <Menu className="min-w-[180px]">
                    <MenuItem className="flex w-full items-center px-5 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                      <Link href="/favorites" className="w-full">
                        <Text slot="label" className="text-base font-bold">
                          お気に入り
                        </Text>
                      </Link>
                    </MenuItem>
                    <MenuItem className="flex w-full items-center px-5 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                      <Link href="/cat-list" className="w-full">
                        <Text slot="label" className="text-base font-bold">
                          にゃんリスト
                        </Text>
                      </Link>
                    </MenuItem>
                    <MenuItem className="flex w-full items-center px-5 py-2 text-left text-base font-medium text-orange-50 hover:bg-orange-600">
                      <Link href="/logout" className="w-full">
                        <Text slot="label" className="text-base font-bold">
                          ログアウト
                        </Text>
                      </Link>
                    </MenuItem>
                  </Menu>
                </Popover>
              </MenuTrigger>
            ) : (
              <LoginButton language={language} />
            )}
          </div>
        </div>
      </div>
    </ReactAriaHeader>
  );
};
