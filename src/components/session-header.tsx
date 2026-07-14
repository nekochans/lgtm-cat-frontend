import { type JSX, Suspense } from "react";
import { Header } from "@/components/header";
import { getCachedSession } from "@/lib/better-auth/session";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly language: Language;
}

async function SessionHeaderContent({
  currentUrlPath,
  language,
}: Props): Promise<JSX.Element> {
  const session = await getCachedSession();

  return (
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={session != null}
      language={language}
    />
  );
}

/**
 * セッション状態に応じて Header の表示（ログインボタン / ログイン済みメニュー）を
 * 切り替える Server Component。
 *
 * cacheComponents 有効時、headers() へのアクセスは Suspense 境界内で行う必要があるため
 * Suspense を内蔵している。fallback の未ログイン Header が静的シェルに含まれ、
 * 実際のセッション状態はリクエスト時に streaming で差し替わる。
 *
 * 注意:
 * - このファイルは import 時に環境変数検証で throw する auth.ts に依存する。
 *   Storybook から到達するモジュール（src/components/ の他コンポーネントや
 *   src/features/ 配下）から import してはならない。使用箇所は src/app/ 配下の
 *   page.tsx に限定する。stories も作成しない。
 * - "use cache" が付いたページコンポーネントの内側でこのコンポーネントを
 *   組み立ててはならない（headers() がキャッシュスコープ内で呼ばれてエラーになる）。
 */
export function SessionHeader(props: Props): JSX.Element {
  return (
    <Suspense
      fallback={
        <Header
          currentUrlPath={props.currentUrlPath}
          isLoggedIn={false}
          language={props.language}
        />
      }
    >
      <SessionHeaderContent {...props} />
    </Suspense>
  );
}
