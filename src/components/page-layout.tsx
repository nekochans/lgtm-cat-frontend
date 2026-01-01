// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ReactNode } from "react";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";
import { Footer } from "./footer";
import { Header } from "./header";

interface Props {
  readonly children: ReactNode;
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn?: boolean;
  readonly mainClassName?: string;
}

const defaultMainClassName =
  "relative flex w-full flex-1 flex-col items-center px-4 py-8";

/**
 * アプリケーション共通のページレイアウトコンポーネント
 * Header、main、Footerを含む基本構造を提供
 */
export function PageLayout({
  children,
  language,
  currentUrlPath,
  isLoggedIn = false,
  mainClassName = defaultMainClassName,
}: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={isLoggedIn}
        language={language}
      />
      <main className={mainClassName}>{children}</main>
      <Footer language={language} />
    </div>
  );
}
