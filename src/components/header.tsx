// 絶対厳守：編集前に必ずAI実装ルールを読む
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import Link from "next/link";
import type { JSX } from "react";
import { HeaderLogo } from "@/components/header-logo";
import { DownIcon } from "@/components/icons/down-icon";
import { GithubIcon } from "@/components/icons/github-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { RightIcon } from "@/components/icons/right-icon";
import { LoginButton } from "@/components/login-button";
import { createExternalTransmissionPolicyLinksFromLanguages } from "@/features/external-transmission-policy";
import { type Language, removeLanguageFromAppPath } from "@/features/language";
import { createPrivacyPolicyLinksFromLanguages } from "@/features/privacy-policy";
import { createTermsOfUseLinksFromLanguages } from "@/features/terms-of-use";
import { appPathList, type IncludeLanguageAppPath } from "@/features/url";
import {
  favoriteListText,
  howToUseText,
  logoutText,
  meowlistText,
  policyText,
  uploadText,
} from "./header-i18n";

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
    <header className="w-full border-orange-300 border-b bg-primary">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <HeaderLogo language={language} />
            <nav className="flex items-center gap-1">
              <Link
                className="flex items-center justify-center bg-primary p-5 font-bold text-background text-base hover:text-button-tertiary-hover"
                href={appPathList.upload}
              >
                {uploadText(language)}
              </Link>
              <Link
                className="flex items-center justify-center bg-primary p-5 font-bold text-background text-base hover:text-button-tertiary-hover"
                href="/how-to-use"
              >
                {howToUseText(language)}
              </Link>
              <Link
                className="flex items-center justify-center bg-primary p-5 font-bold text-background text-base hover:text-button-tertiary-hover"
                href={terms.link}
              >
                {terms.text}
              </Link>
              <Dropdown
                classNames={{
                  content: "p-0",
                }}
              >
                <DropdownTrigger>
                  <Button
                    className="flex items-center justify-center gap-2 bg-transparent px-5 py-2 font-bold text-background text-base hover:text-button-tertiary-hover data-[hover=true]:bg-transparent"
                    variant="light"
                  >
                    {policyText(language)}
                    <DownIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Policy menu"
                  className="min-w-[200px] max-w-[400px] rounded-lg bg-primary p-2"
                  classNames={{ base: "!gap-0", list: "gap-0" }}
                >
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    href={privacy.link}
                    key="privacy"
                  >
                    {privacy.text}
                  </DropdownItem>
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    href={externalTransmissionPolicy.link}
                    key="external-transmission"
                  >
                    {externalTransmissionPolicy.text}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              classNames={{
                content: "p-0",
              }}
            >
              <DropdownTrigger>
                <Button
                  className="border-2 border-background bg-primary px-5 py-3 font-bold text-background text-base hover:bg-primary"
                  variant="bordered"
                >
                  <GlobeIcon />
                  language
                  <DownIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Language selection"
                className="min-w-[180px] rounded-lg bg-primary p-2"
                classNames={{ base: "!gap-0", list: "gap-0" }}
                selectedKeys={language === "ja" ? ["ja"] : ["en"]}
                selectionMode="single"
              >
                <DropdownItem
                  as={Link}
                  className={`rounded-lg px-3 py-2 font-bold text-xl ${
                    language === "ja"
                      ? "!bg-orange-400 data-[hover=true]:!bg-orange-300 text-background"
                      : "data-[hover=true]:!bg-orange-300 text-background"
                  }`}
                  href={removedLanguagePath}
                  key="ja"
                  startContent={language === "ja" ? <RightIcon /> : null}
                >
                  日本語
                </DropdownItem>
                <DropdownItem
                  as={Link}
                  className={`rounded-lg px-3 py-2 font-bold text-xl ${
                    language === "en"
                      ? "!bg-orange-400 data-[hover=true]:!bg-orange-300 text-background"
                      : "data-[hover=true]:!bg-orange-300 text-background"
                  }`}
                  href={`/en${removedLanguagePath}`}
                  key="en"
                  startContent={language === "en" ? <RightIcon /> : null}
                >
                  English
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {isLoggedIn ? (
              <Dropdown
                classNames={{
                  content: "p-0",
                }}
              >
                <DropdownTrigger>
                  <Button
                    className="bg-transparent px-5 py-2 data-[hover=true]:bg-transparent"
                    isIconOnly
                    variant="light"
                  >
                    <GithubIcon color="white" height={24} width={24} />
                    <DownIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="User menu"
                  className="min-w-[180px] rounded-lg bg-primary p-2"
                  classNames={{ base: "!gap-0", list: "gap-0" }}
                >
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    href="/favorites"
                    key="favorites"
                  >
                    {favoriteListText(language)}
                  </DropdownItem>
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    href="/cat-list"
                    key="cat-list"
                  >
                    {meowlistText(language)}
                  </DropdownItem>
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    href="/logout"
                    key="logout"
                  >
                    {logoutText(language)}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <LoginButton language={language} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
