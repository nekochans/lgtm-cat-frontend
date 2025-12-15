// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
} from "@heroui/react";
import Link from "next/link";
import { type JSX, useState } from "react";
import {
  closeMenuAriaLabel,
  favoriteListText,
  homeText,
  howToUseText,
  loginText,
  logoutText,
  meowlistText,
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
import { type Language, removeLanguageFromAppPath } from "@/features/language";
import {
  createIncludeLanguageAppPath,
  type IncludeLanguageAppPath,
} from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};

// メニューの種類: "navigation"はハンバーガーメニュー、"language"は言語選択メニュー
type MenuType = "navigation" | "language";

type LanguageMenuNavProps = {
  readonly language: Language;
  readonly removedLanguagePath: string;
  readonly onLinkClick: () => void;
};

function LanguageMenuNav({
  language,
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
        href={removedLanguagePath}
        onClick={onLinkClick}
      >
        {isJapanese && <RightIcon />}
        <span className={jaSpanClassName}>日本語</span>
      </Link>
      <Link
        className={`flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-3 text-background text-base ${enClassName}`}
        href={`/en${removedLanguagePath}`}
        onClick={onLinkClick}
      >
        {isEnglish && <RightIcon />}
        <span className={enSpanClassName}>English</span>
      </Link>
    </nav>
  );
}

type UnloggedInMenuProps = {
  readonly language: Language;
  readonly removedLanguagePath: string;
  readonly menuType: MenuType;
  readonly onCloseMenus: () => void;
};

function UnloggedInMenu({
  language,
  removedLanguagePath,
  menuType,
  onCloseMenus,
}: UnloggedInMenuProps): JSX.Element {
  return (
    <>
      <Button
        as={Link}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-7 py-2 font-bold text-text-br text-xl"
        href={createIncludeLanguageAppPath("login", language)}
        onClick={onCloseMenus}
      >
        <GithubIcon color="default" height={20} width={20} />
        {loginText(language)}
      </Button>

      {/* 言語メニュー: 言語選択のみ表示 */}
      {menuType === "language" && (
        <LanguageMenuNav
          language={language}
          onLinkClick={onCloseMenus}
          removedLanguagePath={removedLanguagePath}
        />
      )}

      {/* ナビゲーションメニュー: HOME、アップロード、使い方を表示 */}
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
            // TODO: /how-to-use ページ実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
            href="/how-to-use"
            onClick={onCloseMenus}
          >
            {howToUseText(language)}
          </Link>
        </>
      )}
    </>
  );
}

type LoggedInMenuProps = {
  readonly language: Language;
  readonly removedLanguagePath: string;
  readonly menuType: MenuType;
  readonly onCloseMenus: () => void;
};

function LoggedInMenu({
  language,
  removedLanguagePath,
  menuType,
  onCloseMenus,
}: LoggedInMenuProps): JSX.Element {
  return (
    <>
      <Button
        as={Link}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-6 py-2 font-bold text-text-br text-xl"
        // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
        href="/logout"
        onClick={onCloseMenus}
      >
        {logoutText(language)}
      </Button>

      {/* 言語メニュー: 言語選択のみ表示 */}
      {menuType === "language" && (
        <LanguageMenuNav
          language={language}
          onLinkClick={onCloseMenus}
          removedLanguagePath={removedLanguagePath}
        />
      )}

      {/* ナビゲーションメニュー: お気に入り、猫リストを表示 */}
      {menuType === "navigation" && (
        <>
          <Link
            className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
            // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
            href="/favorites"
            onClick={onCloseMenus}
          >
            <HeartIcon color="white" height={24} width={24} />
            {favoriteListText(language)}
          </Link>
          <Link
            className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
            // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
            href="/cat-list"
            onClick={onCloseMenus}
          >
            <CatNyanIcon color="white" height={24} width={24} />
            {meowlistText(language)}
          </Link>
        </>
      )}
    </>
  );
}

export function HeaderMobile({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
  // HeroUI の useDisclosure フックでDrawerの開閉状態を管理
  const {
    isOpen: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure();
  // メニューの種類を管理: "navigation"はハンバーガーメニュー、"language"は言語選択メニュー
  const [menuType, setMenuType] = useState<MenuType>("navigation");

  const removedLanguagePath = removeLanguageFromAppPath(currentUrlPath);

  // メニュータイプをトグル（navigation ⇔ language）
  const handleMenuTypeToggle = () => {
    setMenuType((prev) => (prev === "navigation" ? "language" : "navigation"));
  };

  const handleCloseMenus = () => {
    onMenuClose();
    setMenuType("navigation");
  };

  // ハンバーガーメニューを開く
  const handleOpenNavigationMenu = () => {
    setMenuType("navigation");
    onMenuOpen();
  };

  // 言語メニューを開く
  const handleOpenLanguageMenu = () => {
    setMenuType("language");
    onMenuOpen();
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

      {/* メニューDrawer（右からスライドイン） */}
      <Drawer
        classNames={{
          base: "bg-primary",
        }}
        hideCloseButton
        isOpen={isMenuOpen}
        onClose={handleCloseMenus}
        placement="right"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              {/* Drawer内のヘッダー */}
              <DrawerHeader className="flex items-center justify-between border-orange-300 border-b bg-primary px-4 py-2">
                <HeaderLogo language={language} size="mobile" />
                <div className="flex items-center gap-3">
                  {/* Drawer内の地球儀アイコン: メニュータイプを切り替え */}
                  <button
                    aria-label={switchLanguageAriaLabel(language)}
                    className="p-1"
                    onClick={handleMenuTypeToggle}
                    type="button"
                  >
                    <GlobeIcon />
                  </button>
                  <button
                    aria-label={closeMenuAriaLabel(language)}
                    className="p-1"
                    onClick={onClose}
                    type="button"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </DrawerHeader>

              {/* Drawer内のボディ（メニューコンテンツ） */}
              <DrawerBody className="bg-primary px-5 py-10">
                {!isLoggedIn && (
                  <UnloggedInMenu
                    language={language}
                    menuType={menuType}
                    onCloseMenus={handleCloseMenus}
                    removedLanguagePath={removedLanguagePath}
                  />
                )}
                {isLoggedIn && (
                  <LoggedInMenu
                    language={language}
                    menuType={menuType}
                    onCloseMenus={handleCloseMenus}
                    removedLanguagePath={removedLanguagePath}
                  />
                )}
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
