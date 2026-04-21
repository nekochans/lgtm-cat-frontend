// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/types/language";
import type { OpenGraphLocale } from "@/types/open-graph-locale";

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
