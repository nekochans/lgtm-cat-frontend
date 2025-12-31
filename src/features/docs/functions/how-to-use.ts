// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "@/features/language";
import type { LinkAttribute } from "@/features/link-attribute";
import { createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assert-never";

export function createHowToUseLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "How to Use",
        link: createIncludeLanguageAppPath("docs-how-to-use", language),
      };
    case "ja":
      return {
        text: "使い方",
        link: createIncludeLanguageAppPath("docs-how-to-use", language),
      };
    default:
      return assertNever(language);
  }
}
