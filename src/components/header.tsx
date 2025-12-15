// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import type { JSX } from "react";
import { HeaderDesktop } from "@/components/header-desktop";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

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
  return (
    // TODO: 新しく https://github.com/nekochans/lgtm-cat-frontend/issues/348 でHeaderMobile を作成してレスポンシブ対応を実施する
    <HeaderDesktop
      currentUrlPath={currentUrlPath}
      isLoggedIn={isLoggedIn}
      language={language}
    />
  );
}
