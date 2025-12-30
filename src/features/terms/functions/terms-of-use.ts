// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "@/features/language";
import type { LinkAttribute } from "@/features/link-attribute";
import { createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assert-never";

export function createTermsOfUseLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "Terms of Use",
        link: createIncludeLanguageAppPath("terms", language),
      };
    case "ja":
      return {
        text: "利用規約",
        link: createIncludeLanguageAppPath("terms", language),
      };
    default:
      return assertNever(language);
  }
}
