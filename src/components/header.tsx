"use client";

import type { JSX } from "react";
import { HeaderDesktop } from "@/components/header-desktop";
import { HeaderMobile } from "@/components/header-mobile";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
  readonly language: Language;
  readonly loginReturnTo?: IncludeLanguageAppPath;
}

export function Header({
  language,
  currentUrlPath,
  isLoggedIn,
  loginReturnTo,
}: Props): JSX.Element {
  return (
    <>
      {/* モバイル: md未満で表示 */}
      <div className="md:hidden">
        <HeaderMobile
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
          loginReturnTo={loginReturnTo}
        />
      </div>
      {/* デスクトップ: md以上で表示 */}
      <div className="hidden md:block">
        <HeaderDesktop
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
          loginReturnTo={loginReturnTo}
        />
      </div>
    </>
  );
}
