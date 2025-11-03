import Link from "next/link";
import type { JSX } from "react";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Header as ReactAriaHeader,
  Text,
} from "react-aria-components";
import { HeaderLogo } from "@/components/HeaderLogo";
import { DownIcon } from "@/components/icons/DownIcon";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { GlobeIcon } from "@/components/icons/GlobeIcon";
import { RightIcon } from "@/components/icons/RightIcon";
import { LoginButton } from "@/components/LoginButton";
import { createExternalTransmissionPolicyLinksFromLanguages } from "@/features/externalTransmissionPolicy";
import { type Language, removeLanguageFromAppPath } from "@/features/language";
import { createPrivacyPolicyLinksFromLanguages } from "@/features/privacyPolicy";
import { createTermsOfUseLinksFromLanguages } from "@/features/termsOfUse";
import { appPathList, type IncludeLanguageAppPath } from "@/features/url";
import {
  favoriteListText,
  howToUseText,
  logoutText,
  meowlistText,
  policyText,
  uploadText,
} from "./HeaderI18n";

type Props = {
  language: Language;
  currentUrlPath: IncludeLanguageAppPath;
  isLoggedIn: boolean;
};

export function Header({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
  const terms = createTermsOfUseLinksFromLanguages(language);
  const privacy = createPrivacyPolicyLinksFromLanguages(language);
  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);
  const removedLanguagePath = removeLanguageFromAppPath(currentUrlPath);

  return (
    <ReactAriaHeader className="w-full border-orange-300 border-b bg-orange-500">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <HeaderLogo language={language} />
            <nav className="flex items-center gap-1">
              <Link
                className="flex items-center justify-center bg-orange-500 p-5 font-medium text-base text-orange-50 hover:text-orange-100"
                href={appPathList.upload}
              >
                <Text className="font-bold text-base" slot="label">
                  {uploadText(language)}
                </Text>
              </Link>
              <Link
                className="flex items-center justify-center bg-orange-500 p-5 font-medium text-base text-orange-50 hover:text-orange-100"
                href="/how-to-use"
              >
                <Text className="font-bold text-base" slot="label">
                  {howToUseText(language)}
                </Text>
              </Link>
              <Link
                className="flex items-center justify-center bg-orange-500 p-5 font-medium text-base text-orange-50 hover:text-orange-100"
                href={terms.link}
              >
                <Text className="font-bold text-base" slot="label">
                  {terms.text}
                </Text>
              </Link>
              <MenuTrigger>
                <Button className="flex items-center justify-center gap-2 bg-orange-500 px-5 py-2 font-medium text-base text-orange-50 hover:text-orange-100">
                  <Text className="font-bold text-base">
                    {policyText(language)}
                  </Text>
                  <DownIcon />
                </Button>
                <Popover className="bg-orange-500 shadow-lg ring-1 ring-black/5">
                  <Menu className="min-w-[200px] max-w-[400px]">
                    <MenuItem className="flex w-full items-center px-6 py-2 text-left font-medium text-base text-orange-50 hover:bg-orange-600">
                      <Link className="w-full" href={privacy.link}>
                        <Text className="font-bold text-base" slot="label">
                          {privacy.text}
                        </Text>
                      </Link>
                    </MenuItem>
                    <MenuItem className="flex w-full items-center px-6 py-2 text-left font-medium text-base text-orange-50 hover:bg-orange-600">
                      <Link
                        className="w-full"
                        href={externalTransmissionPolicy.link}
                      >
                        <Text className="font-bold text-base" slot="label">
                          {externalTransmissionPolicy.text}
                        </Text>
                      </Link>
                    </MenuItem>
                  </Menu>
                </Popover>
              </MenuTrigger>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <MenuTrigger>
              <Button className="flex items-center justify-center gap-2 bg-orange-500 px-5 py-2 font-medium text-base text-orange-50 hover:text-orange-100">
                <span className="flex items-center justify-center">
                  <GlobeIcon />
                </span>
                <Text className="font-bold text-base">language</Text>
                <span className="flex items-center justify-center">
                  <DownIcon />
                </span>
              </Button>
              <Popover className="bg-orange-500 shadow-lg ring-1 ring-black/5">
                <Menu className="min-w-[180px]">
                  <MenuItem
                    className={`flex w-full items-center px-5 py-2 text-left font-medium text-base ${
                      language === "ja"
                        ? "bg-orange-400 text-orange-50"
                        : "bg-orange-500 text-orange-50 hover:bg-orange-600"
                    }`}
                  >
                    <Link
                      className="flex w-full items-center"
                      href={removedLanguagePath}
                    >
                      <span className="flex items-center gap-2">
                        {language === "ja" && <RightIcon />}
                        <Text className="font-bold text-base" slot="label">
                          日本語
                        </Text>
                      </span>
                    </Link>
                  </MenuItem>
                  <MenuItem
                    className={`flex w-full items-center px-5 py-2 text-left font-medium text-base ${
                      language === "en"
                        ? "bg-orange-400 text-orange-50"
                        : "bg-orange-500 text-orange-50 hover:bg-orange-600"
                    }`}
                  >
                    <Link
                      className="flex w-full items-center"
                      href={`/en${removedLanguagePath}`}
                    >
                      <span className="flex items-center gap-2">
                        {language === "en" && <RightIcon />}
                        <Text className="font-bold text-base" slot="label">
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
                <Button className="flex items-center justify-center gap-2 bg-orange-500 px-5 py-2 font-medium text-base text-orange-50 hover:text-orange-100">
                  <span className="flex items-center gap-2">
                    <GithubIcon color="white" height={24} width={24} />
                    <DownIcon />
                  </span>
                </Button>
                <Popover className="mx-4 bg-orange-500 shadow-lg ring-1 ring-black/5">
                  <Menu className="min-w-[180px]">
                    <MenuItem className="flex w-full items-center px-5 py-2 text-left font-medium text-base text-orange-50 hover:bg-orange-600">
                      <Link className="w-full" href="/favorites">
                        <Text className="font-bold text-base" slot="label">
                          {favoriteListText(language)}
                        </Text>
                      </Link>
                    </MenuItem>
                    <MenuItem className="flex w-full items-center px-5 py-2 text-left font-medium text-base text-orange-50 hover:bg-orange-600">
                      <Link className="w-full" href="/cat-list">
                        <Text className="font-bold text-base" slot="label">
                          {meowlistText(language)}
                        </Text>
                      </Link>
                    </MenuItem>
                    <MenuItem className="flex w-full items-center px-5 py-2 text-left font-medium text-base text-orange-50 hover:bg-orange-600">
                      <Link className="w-full" href="/logout">
                        <Text className="font-bold text-base" slot="label">
                          {logoutText(language)}
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
}
