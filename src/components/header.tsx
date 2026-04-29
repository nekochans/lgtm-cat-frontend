"use client";

import type { JSX } from "react";
import { HeaderDesktop } from "@/components/header-desktop";
import { HeaderMobile } from "@/components/header-mobile";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  // TODO: ログイン機能実装後は hideLoginButton Propsを削除する
  readonly hideLoginButton?: boolean;
  readonly isLoggedIn: boolean;
  readonly language: Language;
}

export function Header({
  language,
  currentUrlPath,
  hideLoginButton,
  isLoggedIn,
}: Props): JSX.Element {
  return (
    <>
      {/* モバイル: md未満で表示 */}
      <div className="md:hidden">
        <HeaderMobile
          currentUrlPath={currentUrlPath}
          hideLoginButton={hideLoginButton}
          isLoggedIn={isLoggedIn}
          language={language}
        />
      </div>
      {/* デスクトップ: md以上で表示 */}
      <div className="hidden md:block">
        <HeaderDesktop
          currentUrlPath={currentUrlPath}
          hideLoginButton={hideLoginButton}
          isLoggedIn={isLoggedIn}
          language={language}
        />
      </div>
    </>
  );
}
