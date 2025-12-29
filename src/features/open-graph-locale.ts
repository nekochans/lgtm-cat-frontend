// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "./language";

/**
 * Open Graph locale形式のロケール文字列
 *
 * 注意: BCP 47の標準表記はハイフン区切り (ja-JP, en-US) ですが、
 * Open Graphの og:locale プロパティでは慣習的にアンダースコア区切りを使用します。
 */
// 注意: 日本語サイトのため日本語を先頭に配置
const openGraphLocales = ["ja_JP", "en_US"] as const;

export type OpenGraphLocale = (typeof openGraphLocales)[number];

/**
 * Language から OpenGraphLocale への変換マップ
 *
 * 重要: Record<Language, OpenGraphLocale> 形式を維持することで、
 * 将来 Language が増えた場合に TypeScript が網羅性チェックを行い、
 * マップへの追加漏れをコンパイル時に検出できます。
 */
const languageToOpenGraphLocaleMap: Record<Language, OpenGraphLocale> = {
  ja: "ja_JP",
  en: "en_US",
};

export function convertLanguageToOpenGraphLocale(
  language: Language
): OpenGraphLocale {
  return languageToOpenGraphLocaleMap[language];
}
