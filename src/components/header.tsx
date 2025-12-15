// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import type { JSX } from "react";
import { HeaderDesktop } from "@/components/header-desktop";
import { HeaderMobile } from "@/components/header-mobile";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};

export function Header({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
  return (
    <>
      {/* モバイル: md未満で表示 */}
      <div className="md:hidden">
        <HeaderMobile
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
        />
      </div>
      {/* デスクトップ: md以上で表示 */}
      <div className="hidden md:block">
        <HeaderDesktop
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
        />
      </div>
    </>
  );
}
