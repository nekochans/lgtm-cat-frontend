"use client";

import { Dropdown } from "@heroui/react";
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
import { createGitHubAppLinksFromLanguages } from "@/functions/github-app";
import { createHowToUseLinksFromLanguages } from "@/functions/how-to-use";
import { removeLanguageFromAppPath } from "@/functions/language";
import { createMcpLinksFromLanguages } from "@/functions/mcp";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  // TODO: ログイン機能実装後は hideLoginButton Propsを削除する
  readonly hideLoginButton?: boolean;
  readonly isLoggedIn: boolean;
  readonly language: Language;
}

export function HeaderDesktop({
  language,
  currentUrlPath,
  hideLoginButton,
  isLoggedIn,
}: Props): JSX.Element {
  const githubApp = createGitHubAppLinksFromLanguages(language);
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
              <Dropdown>
                <Dropdown.Trigger className="flex items-center justify-center gap-2 rounded-xl bg-transparent px-5 py-2 font-bold text-background text-base hover:text-button-tertiary-hover">
                  {documentsText(language)}
                  <DownIcon />
                </Dropdown.Trigger>
                <Dropdown.Popover className="!rounded-[14px] !p-0">
                  <Dropdown.Menu
                    aria-label="Documents menu"
                    className="!gap-0 min-w-[200px] max-w-[400px] rounded-lg bg-primary p-2"
                  >
                    <Dropdown.Item
                      className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
                      href={howToUse.link}
                      id="how-to-use"
                      textValue={howToUse.text}
                    >
                      {howToUse.text}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
                      href={mcp.link}
                      id="mcp"
                      textValue={mcp.text}
                    >
                      {mcp.text}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
                      href={githubApp.link}
                      id="github-app"
                      textValue={githubApp.text}
                    >
                      {githubApp.text}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown>
              <Dropdown.Trigger className="flex h-10 items-center gap-2 rounded-xl border-2 border-background bg-primary px-5 py-3 font-bold text-background text-base hover:bg-primary">
                <GlobeIcon />
                language
                <DownIcon />
              </Dropdown.Trigger>
              <Dropdown.Popover className="!rounded-[14px] !p-0">
                <Dropdown.Menu
                  aria-label="Language selection"
                  className="!gap-0 min-w-[180px] rounded-lg bg-primary p-2"
                >
                  <Dropdown.Item
                    className={`data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm ${
                      language === "ja" ? "!bg-orange-400" : ""
                    }`}
                    href={removedLanguagePath}
                    id="ja"
                    textValue="日本語"
                  >
                    <div className="flex items-center gap-3">
                      {language === "ja" ? (
                        <RightIcon />
                      ) : (
                        <span className="w-4" />
                      )}
                      日本語
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={`data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm ${
                      language === "en" ? "!bg-orange-400" : ""
                    }`}
                    href={
                      removedLanguagePath === "/"
                        ? "/en"
                        : `/en${removedLanguagePath}`
                    }
                    id="en"
                    textValue="English"
                  >
                    <div className="flex items-center gap-3">
                      {language === "en" ? (
                        <RightIcon />
                      ) : (
                        <span className="w-4" />
                      )}
                      English
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
            {isLoggedIn ? (
              <Dropdown>
                <Dropdown.Trigger
                  aria-label="User menu"
                  className="flex items-center gap-1 rounded-xl bg-transparent px-5 py-2"
                >
                  <GithubIcon color="white" height={24} width={24} />
                  <DownIcon />
                </Dropdown.Trigger>
                <Dropdown.Popover className="!rounded-[14px] !p-0">
                  <Dropdown.Menu
                    aria-label="User menu"
                    className="!gap-0 min-w-[180px] rounded-lg bg-primary p-2"
                  >
                    <Dropdown.Item
                      className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
                      href="/favorites"
                      id="favorites"
                      textValue={favoriteListText(language)}
                    >
                      {favoriteListText(language)}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
                      href="/cat-list"
                      id="cat-list"
                      textValue={meowlistText(language)}
                    >
                      {meowlistText(language)}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
                      href="/logout"
                      id="logout"
                      textValue={logoutText(language)}
                    >
                      {logoutText(language)}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
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
