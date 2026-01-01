// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "@/features/language";
import type { LinkAttribute } from "@/features/link-attribute";
import { createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assert-never";

export function createPrivacyPolicyLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "Privacy Policy",
        link: createIncludeLanguageAppPath("privacy", language),
      };
    case "ja":
      return {
        text: "プライバシーポリシー",
        link: createIncludeLanguageAppPath("privacy", language),
      };
    default:
      return assertNever(language);
  }
}
