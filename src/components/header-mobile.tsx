"use client";

import { Drawer, useOverlayState } from "@heroui/react";
import Link from "next/link";
import { type JSX, useState } from "react";
import {
  closeMenuAriaLabel,
  favoriteListText,
  githubAppText,
  homeText,
  howToUseText,
  loginText,
  logoutText,
  mcpText,
  myCatsText,
  openMenuAriaLabel,
  switchLanguageAriaLabel,
  uploadText,
} from "@/components/header-i18n";
import { HeaderLogo } from "@/components/header-logo";
import { CatNyanIcon } from "@/components/icons/cat-nyan-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { GithubIcon } from "@/components/icons/github-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { RightIcon } from "@/components/icons/right-icon";
import { createLoginAppPath } from "@/functions/auth";
import { removeLanguageFromAppPath } from "@/functions/language";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath, LanguageSwitchHrefs } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
  readonly language: Language;
  readonly languageSwitchHrefs?: LanguageSwitchHrefs;
  readonly loginReturnTo?: IncludeLanguageAppPath;
}

// メニューの種類: "navigation"はハンバーガーメニュー、"language"は言語選択メニュー
type MenuType = "navigation" | "language";

function drawerAriaLabel(menuType: MenuType, language: Language): string {
  if (menuType === "language") {
    return language === "ja" ? "言語選択メニュー" : "Language selection menu";
  }
  return language === "ja" ? "ナビゲーションメニュー" : "Navigation menu";
}

interface LanguageMenuNavProps {
  readonly language: Language;
  readonly languageSwitchHrefs?: LanguageSwitchHrefs;
  readonly onLinkClick: () => void;
  readonly removedLanguagePath: string;
}

function LanguageMenuNav({
  language,
  languageSwitchHrefs,
  removedLanguagePath,
  onLinkClick,
}: LanguageMenuNavProps): JSX.Element {
  const isJapanese = language === "ja";
  const isEnglish = language === "en";
  const jaClassName = isJapanese ? "bg-orange-400" : "";
  const enClassName = isEnglish ? "bg-orange-400" : "";
  const jaSpanClassName = isJapanese ? "" : "pl-5";
  const enSpanClassName = isEnglish ? "" : "pl-5";

  return (
    <nav className="mb-4">
      <Link
        className={`flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-3 text-background text-base ${jaClassName}`}
        href={languageSwitchHrefs?.ja ?? removedLanguagePath}
        onClick={onLinkClick}
      >
        {isJapanese && <RightIcon />}
        <span className={jaSpanClassName}>日本語</span>
      </Link>
      <Link
        className={`flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-3 text-background text-base ${enClassName}`}
        href={
          languageSwitchHrefs?.en ??
          (removedLanguagePath === "/" ? "/en" : `/en${removedLanguagePath}`)
        }
        onClick={onLinkClick}
      >
        {isEnglish && <RightIcon />}
        <span className={enSpanClassName}>English</span>
      </Link>
    </nav>
  );
}

interface UnloggedInMenuProps {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly language: Language;
  readonly languageSwitchHrefs?: LanguageSwitchHrefs;
  readonly menuType: MenuType;
  readonly onCloseMenus: () => void;
  readonly removedLanguagePath: string;
}

function UnloggedInMenu({
  currentUrlPath,
  language,
  languageSwitchHrefs,
  removedLanguagePath,
  menuType,
  onCloseMenus,
}: UnloggedInMenuProps): JSX.Element {
  return (
    <>
      <Link
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-7 py-2 font-bold text-text-br text-xl"
        href={createLoginAppPath(language, { returnTo: currentUrlPath })}
        onClick={onCloseMenus}
      >
        <GithubIcon color="default" height={20} width={20} />
        {loginText(language)}
      </Link>

      {/* 言語メニュー: 言語選択のみ表示 */}
      {menuType === "language" && (
        <LanguageMenuNav
          language={language}
          languageSwitchHrefs={languageSwitchHrefs}
          onLinkClick={onCloseMenus}
          removedLanguagePath={removedLanguagePath}
        />
      )}

      {/* ナビゲーションメニュー: HOME、アップロード、使い方、MCPの使い方を表示 */}
      {menuType === "navigation" && (
        <>
          <Link
            className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
            href={createIncludeLanguageAppPath("home", language)}
            onClick={onCloseMenus}
          >
            {homeText(language)}
          </Link>
          <Link
            className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
            href={createIncludeLanguageAppPath("upload", language)}
            onClick={onCloseMenus}
          >
            {uploadText(language)}
          </Link>
          <Link
            className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
            href={createIncludeLanguageAppPath("docs-how-to-use", language)}
            onClick={onCloseMenus}
          >
            {howToUseText(language)}
          </Link>
          <Link
            className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
            href={createIncludeLanguageAppPath("docs-mcp", language)}
            onClick={onCloseMenus}
          >
            {mcpText(language)}
          </Link>
          <Link
            className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
            href={createIncludeLanguageAppPath("docs-github-app", language)}
            onClick={onCloseMenus}
          >
            {githubAppText(language)}
          </Link>
        </>
      )}
    </>
  );
}

interface LoggedInMenuProps {
  readonly language: Language;
  readonly languageSwitchHrefs?: LanguageSwitchHrefs;
  readonly menuType: MenuType;
  readonly onCloseMenus: () => void;
  readonly removedLanguagePath: string;
}

function LoggedInMenu({
  language,
  languageSwitchHrefs,
  removedLanguagePath,
  menuType,
  onCloseMenus,
}: LoggedInMenuProps): JSX.Element {
  return (
    <>
      <Link
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-6 py-2 font-bold text-text-br text-xl"
        href={createIncludeLanguageAppPath("logout", language)}
        onClick={onCloseMenus}
      >
        {logoutText(language)}
      </Link>

      {/* 言語メニュー: 言語選択のみ表示 */}
      {menuType === "language" && (
        <LanguageMenuNav
          language={language}
          languageSwitchHrefs={languageSwitchHrefs}
          onLinkClick={onCloseMenus}
          removedLanguagePath={removedLanguagePath}
        />
      )}

      {/* ナビゲーションメニュー: お気に入り、My Cats を表示 */}
      {menuType === "navigation" && (
        <>
          <Link
            className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
            href={createIncludeLanguageAppPath("favorites", language)}
            onClick={onCloseMenus}
          >
            <HeartIcon color="white" height={24} width={24} />
            {favoriteListText(language)}
          </Link>
          <Link
            className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
            href={createIncludeLanguageAppPath("my-cats", language)}
            onClick={onCloseMenus}
          >
            <CatNyanIcon color="white" height={24} width={24} />
            {myCatsText(language)}
          </Link>
        </>
      )}
    </>
  );
}

export function HeaderMobile({
  language,
  languageSwitchHrefs,
  currentUrlPath,
  isLoggedIn,
  loginReturnTo,
}: Props): JSX.Element {
  // HeroUI v3 の useOverlayState フックでDrawerの開閉状態を管理
  const menuState = useOverlayState({ defaultOpen: false });
  // メニューの種類を管理: "navigation"はハンバーガーメニュー、"language"は言語選択メニュー
  const [menuType, setMenuType] = useState<MenuType>("navigation");

  const removedLanguagePath = removeLanguageFromAppPath(currentUrlPath);

  const handleCloseMenus = () => {
    menuState.close();
    setMenuType("navigation");
  };

  // ハンバーガーメニューを開く
  const handleOpenNavigationMenu = () => {
    setMenuType("navigation");
    menuState.open();
  };

  // 言語メニューを開く
  const handleOpenLanguageMenu = () => {
    setMenuType("language");
    menuState.open();
  };

  return (
    <>
      {/* ヘッダーバー（常に表示） */}
      <header className="w-full border-orange-300 border-b bg-primary">
        <div className="flex h-12 items-center justify-between px-4">
          <HeaderLogo language={language} size="mobile" />
          <div className="flex items-center gap-3">
            {/* 地球儀アイコン: 言語メニューを開く */}
            <button
              aria-label={switchLanguageAriaLabel(language)}
              className="p-1"
              onClick={handleOpenLanguageMenu}
              type="button"
            >
              <GlobeIcon />
            </button>
            {/* メニューアイコン: ナビゲーションメニューを開く */}
            <button
              aria-label={openMenuAriaLabel(language)}
              className="p-1"
              onClick={handleOpenNavigationMenu}
              type="button"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* メニューDrawer（右からスライドイン、幅285pxでFigmaデザインに合わせる） */}
      <Drawer state={menuState}>
        <Drawer.Backdrop
          onOpenChange={(open) => {
            menuState.setOpen(open);
            if (!open) {
              setMenuType("navigation");
            }
          }}
        >
          <Drawer.Content placement="right">
            <Drawer.Dialog
              aria-label={drawerAriaLabel(menuType, language)}
              className="!p-0 w-[285px] overflow-hidden rounded-[14px_0_0_14px] bg-primary"
            >
              {/* Drawer内のヘッダー（閉じるアイコンのみ、右寄せ） */}
              <Drawer.Header className="!mb-0 !flex-row items-center justify-end border-orange-300 border-b bg-primary px-4 py-2">
                <button
                  aria-label={closeMenuAriaLabel(language)}
                  className="p-1"
                  onClick={handleCloseMenus}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </Drawer.Header>

              {/* Drawer内のボディ（メニューコンテンツ） */}
              <Drawer.Body className="!m-0 bg-primary px-5 py-10">
                {!isLoggedIn && (
                  <UnloggedInMenu
                    currentUrlPath={loginReturnTo ?? currentUrlPath}
                    language={language}
                    languageSwitchHrefs={languageSwitchHrefs}
                    menuType={menuType}
                    onCloseMenus={handleCloseMenus}
                    removedLanguagePath={removedLanguagePath}
                  />
                )}
                {isLoggedIn && (
                  <LoggedInMenu
                    language={language}
                    languageSwitchHrefs={languageSwitchHrefs}
                    menuType={menuType}
                    onCloseMenus={handleCloseMenus}
                    removedLanguagePath={removedLanguagePath}
                  />
                )}
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
