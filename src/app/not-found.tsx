// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { JSX } from "react";
import { NotFoundPageContainer } from "@/features/errors/components/not-found-page-container";
import type { Language } from "@/features/language";
import { notFoundMetaTag } from "@/features/meta-tag";

// metadataはビルド時に評価されるため、静的な値を使用
// 動的な言語判定はコンポーネント内で行うが、metadataは日本語固定
// これは仕様として許容する（Next.jsのmetadataはリクエスト情報に依存できないため）
const metaTag = notFoundMetaTag("ja");

export const metadata: Metadata = {
  title: metaTag.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * リクエストヘッダーから言語を判定する
 * 判定優先順位:
 * 1. x-pathname ヘッダー（Next.jsミドルウェアで設定可能）
 * 2. x-matched-path ヘッダー（Next.js内部ヘッダー）
 * 3. next-url ヘッダー（Next.js内部ヘッダー）
 * 4. referer ヘッダー（遷移元URL）
 * 5. 日本語にフォールバック
 */
function detectLanguageFromHeaders(headersList: Headers): Language {
  // 優先度1: x-pathname（ミドルウェアで明示的に設定可能）
  const xPathname = headersList.get("x-pathname");
  if (xPathname?.startsWith("/en")) {
    return "en";
  }

  // 優先度2: x-matched-path（Next.js内部ヘッダー）
  const xMatchedPath = headersList.get("x-matched-path");
  if (xMatchedPath?.startsWith("/en")) {
    return "en";
  }

  // 優先度3: next-url（Next.js内部ヘッダー）
  const nextUrl = headersList.get("next-url");
  if (nextUrl?.startsWith("/en")) {
    return "en";
  }

  // 優先度4: referer（遷移元URL）
  const referer = headersList.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.pathname.startsWith("/en")) {
        return "en";
      }
    } catch {
      // URLパースエラーは無視
    }
  }

  // 優先度5: 日本語にフォールバック
  return "ja";
}

export default async function NotFound(): Promise<JSX.Element> {
  // Next.js 16では headers() は非同期関数
  const headersList = await headers();
  const language = detectLanguageFromHeaders(headersList);

  return <NotFoundPageContainer language={language} />;
}
