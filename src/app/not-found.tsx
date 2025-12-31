// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata } from "next";
import type { JSX } from "react";
import { NotFoundPage } from "@/features/errors/components/not-found-page";
import { notFoundMetaTag } from "@/features/meta-tag";

// metadataはビルド時に評価されるため、静的な値を使用
const metaTag = notFoundMetaTag("ja");

export const metadata: Metadata = {
  title: metaTag.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * 404ページコンポーネント
 *
 * Next.js 16のcacheComponents要件により、not-found.tsx内での動的データ
 * (headers()等) へのアクセスはビルドエラーを引き起こすため、
 * 言語は日本語固定としている。
 *
 * 参考: Issue #403
 * 「多言語化対応が難しいという結論なら常に日本語の404ページを返すという対処法でも問題はない」
 */
export default function NotFound(): JSX.Element {
  return <NotFoundPage language="ja" />;
}
