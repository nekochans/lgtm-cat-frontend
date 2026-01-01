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
import {
  documentsText,
  favoriteListText,
  logoutText,
  meowlistText,
  uploadText,
} from "@/components/header-i18n";
import { HeaderLogo } from "@/components/header-logo";
import { DownIcon } from "@/components/icons/down-icon";
import { GithubIcon } from "@/components/icons/github-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { RightIcon } from "@/components/icons/right-icon";
import { LoginButton } from "@/components/login-button";
import { createHowToUseLinksFromLanguages } from "@/features/docs/functions/how-to-use";
import { createMcpLinksFromLanguages } from "@/features/docs/functions/mcp";
import { type Language, removeLanguageFromAppPath } from "@/features/language";
import {
  createIncludeLanguageAppPath,
  type IncludeLanguageAppPath,
} from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  // TODO: ログイン機能実装後は hideLoginButton Propsを削除する
  readonly hideLoginButton?: boolean;
  readonly isLoggedIn: boolean;
}

export function HeaderDesktop({
  language,
  currentUrlPath,
  hideLoginButton,
  isLoggedIn,
}: Props): JSX.Element {
  const howToUse = createHowToUseLinksFromLanguages(language);
  const mcp = createMcpLinksFromLanguages(language);
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
                href={createIncludeLanguageAppPath("upload", language)}
              >
                {uploadText(language)}
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
                    {documentsText(language)}
                    <DownIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Documents menu"
                  className="min-w-[200px] max-w-[400px] rounded-lg bg-primary p-2"
                  classNames={{ base: "!gap-0", list: "gap-0" }}
                >
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    href={howToUse.link}
                    key="how-to-use"
                  >
                    {howToUse.text}
                  </DropdownItem>
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    href={mcp.link}
                    key="mcp"
                  >
                    {mcp.text}
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
              >
                <DropdownItem
                  as={Link}
                  className={`data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl ${
                    language === "ja" ? "!bg-orange-400" : ""
                  }`}
                  href={removedLanguagePath}
                  key="ja"
                  startContent={language === "ja" ? <RightIcon /> : null}
                >
                  日本語
                </DropdownItem>
                <DropdownItem
                  as={Link}
                  className={`data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl ${
                    language === "en" ? "!bg-orange-400" : ""
                  }`}
                  href={
                    removedLanguagePath === "/"
                      ? "/en"
                      : `/en${removedLanguagePath}`
                  }
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
                    aria-label="User menu"
                    className="bg-transparent px-5 py-2 data-[hover=true]:bg-transparent"
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
                    // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
                    href="/favorites"
                    key="favorites"
                  >
                    {favoriteListText(language)}
                  </DropdownItem>
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
                    href="/cat-list"
                    key="cat-list"
                  >
                    {meowlistText(language)}
                  </DropdownItem>
                  <DropdownItem
                    as={Link}
                    className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
                    // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
                    href="/logout"
                    key="logout"
                  >
                    {logoutText(language)}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              // TODO: ログイン機能実装後は hideLoginButton による条件分岐を削除する
              !hideLoginButton && <LoginButton language={language} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
