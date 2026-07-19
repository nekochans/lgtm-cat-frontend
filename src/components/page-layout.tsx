import type { ReactNode } from "react";
import type { Language } from "@/types/language";
import { Footer } from "./footer";

interface Props {
  readonly children: ReactNode;
  /**
   * Header 領域のスロット。
   * - 通常ページ: page.tsx から <SessionHeader> を注入する（セッション状態に応じて表示が切り替わる）
   * - /login, /logout: セッション状態が確定しているため静的な <Header> を注入する
   * - Storybook: <Header isLoggedIn={...}> を直接注入する
   * PageLayout 自身が Header を組み立てない理由: セッション取得は auth.ts（import 時に
   * 環境変数検証で throw する server-only モジュール）に依存し、Storybook から到達する
   * import 経路に含められないため。
   */
  readonly header: ReactNode;
  readonly language: Language;
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
  header,
  language,
  mainClassName = defaultMainClassName,
}: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {header}
      <main className={mainClassName}>{children}</main>
      <Footer language={language} />
    </div>
  );
}
